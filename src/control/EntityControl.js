import * as Packets from '../Packets.js';
import { AI } from '../AI.js';
import { DIRECTION, ENTITY_TYPE } from '../enum/Entity.js';
import { ELEMENT } from '../enum/Element.js';
import { entityInRangeOfEntity, findMapEntitiesInRadius } from '../utils/EntityUtil.js';
import { EXP_TABLE } from '../data/EXP_TABLE.js';

export class EntityControl {
	/**
	 * Creates a new EntityControl instance.
	 * @param {import("../model/Entity.js").Entity} entity - The entity to control.
	 * @param {import("../World.js").World} world - The world instance.
	 * @param {import("ws").WebSocket=} socket - The WebSocket instance.
	 * @param {import("../maps/WorldMap.js").WorldMap=} map - The map instance.
	 */
	constructor(entity, world, socket, map) {
		this.entity = entity

		/** @type {import("../World.js").World} - World instance */
		this.world = world

		/** @type {import("ws").WebSocket} - Web Socket instance */
		this.socket = socket

		/** @type {import("../maps/WorldMap.js").WorldMap} - WorldMap instance */
		this.map = map

		/** @type {import("../AI.js").AI|null=} - Monster AI. default null */
		this.ai = entity.type === ENTITY_TYPE.MONSTER ? new AI(entity) : null

		/** 
		 * @type {import("../model/Entity.js").Entity?} - attacking target entity 
		 */
		this._attacking = null
		/**
		 * @type {import("../model/Entity.js").Entity?} following this entity
		 */
		this._follow = null
		/** 
		 * @type {boolean=} whether the entity can move. default true 
		 */
		this._canMove = true
		/**
		 * @type {number} - timestamp in milliseconds when the entity can auto-attack again cooldown
		 */
		this._attackAutoCd = 0
		/**
		 * @type {number} entity movement started time cooldown. default 0
		 */
		this._moveCd = 0
		/**
		 * @type {number} player update time cooldown. Used to send full player state update every 5 seconds. default 0
		 */
		this._socketSentPlayerUpdateCd = 0
		/**
		 * @type {number} portal used time cooldown. Used to prevent player from using portal too often. default 0
		 */
		this._portalUseCd = 0

		// bind WebSocket functions for Players
		if (entity.type === ENTITY_TYPE.PLAYER) {
			this._onClose = this.onClose.bind(this)
			this._onError = this.onError.bind(this)
			this._onMessage = this.onMessage.bind(this)

			this.socket.on('close', this._onClose)
			this.socket.on('error', this._onError)
			this.socket.on('message', this._onMessage)
		}
	}

	/**
	 * **Player** Called when a new WebSocket message is received from the player
	 * @param {Buffer|string} data 
	 * @param {boolean} isBinary 
	 */
	async onMessage(data, isBinary) {
		try {
			const json = JSON.parse(data.toString());

			if (json.type === 'move') {
				this.onMove(json)
				return
			}

			if (json.type === 'chat') {
				this.onChat(json)
				return
			}

			if (json.type === 'click') {
				this.onClickPosition(json)
				return
			}

			if (json.type === 'npc-dialog-close') {
				this.onNPCDialogClose(json)
				return
			}

			console.log(`[TODO] ${process.pid} message:`, json)
		} catch (e) {
			console.log(`WS ${process.pid} message:`, data.toString(), e.message || e)
		}
	}

	/**
	 * **Player** Called when the player closes the WebSocket connection.
	 */
	onClose() {
		console.log(`Player ${process.pid} connection closed.`);
		this.socket.off('close', this._onClose)
		this.socket.off('error', this._onError)
		this.socket.off('message', this._onMessage)
		this.world.onClientClose(this.entity)
	}

	/**
	 * **Player**  Called when an error occurs in the WebSocket connection.
	 * @param {Error} error 
	 */
	onError(error) {
		console.log(`WS ${process.pid} error:`, error.message || error || '[no-code]');
	}

	/**
	 * **Player** Broadcasts a message to all players in the world instance.
	 * @param {string|Buffer} data 
	 * @param {boolean} isBinary 
	 */
	broadcast(data, isBinary = false) {
		this.world.broadcast(data, isBinary)
	}

	/**
	 * Server update tick callback. Used to send updates to the client.
	 * 
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	onTick(timestamp) {
		switch (this.entity.type) {
			case ENTITY_TYPE.PLAYER:
				this.onTickPlayer(timestamp)
				break
			case ENTITY_TYPE.MONSTER:
				this.onTickMonster(timestamp)
				break
			case ENTITY_TYPE.NPC:
				this.onTickNPC(timestamp)
				break
			case ENTITY_TYPE.PORTAL:
				this.onTickPortal(timestamp)
				break
			default:
				break
		}

	}

	/**
	 * **Player** Server update tick callback. Used to send updates to the client.
	 * @param {number} timestamp 
	 */
	onTickPlayer(timestamp) {
		// update client map data on server update tick,
		// so the client can update the map with new entity positions
		this.socket.send(JSON.stringify(Packets.updateMap(this.map)));

		// send full player state update every 5 seconds
		// send packet to client, containing player data
		if (timestamp > this._socketSentPlayerUpdateCd) {
			// console.log('Sending player update to client:', this.entity.name)
			this._socketSentPlayerUpdateCd = timestamp + 5000
			this.socket.send(JSON.stringify(Packets.updatePlayer(this.entity)));
		}

		// TODO implement other player updates, like stats that needs to be more frequent?
		// skills, equipment, inventory, quests for example, does not need to be updated so frequently.

		// check if player is alive, for the rest of the function
		if (this.entity.hp <= 0) return

		// find entities in nearby for an auto-attack
		this.nearbyAutoAttack(timestamp)

		// continue following target if set
		if (this._follow != null) {
			this.follow(this._follow, timestamp)
		}
	}

	/**
	 * **Monster** Server update tick callback. Used to do animations etc.
	 * @param {number} timestamp 
	 */
	onTickMonster(timestamp) {
		// check if entity is alive
		if (this.entity.hp <= 0) {
			// when entity has been dead for a 5-minutes, revive it
			// and move it to the original position
			if (timestamp - this.entity.death > 5 * 60 * 1000) {
				this.revive()
				this.toSavePosition()
			} else {
				return // wait for revive
			}
		}

		// call AI onUpdate, if it exists
		this.ai.onUpdate(timestamp)

		// find entities in nearby
		// this.detectNearby(4, timestamp)

		// start following target, this has no range limit
		// if (this._follow != null) {
		// 	this.follow(this._follow, timestamp)
		// }
	}

	/**
	 * **NPC** Server update tick callback. Used to do animations etc.
	 * @param {number} timestamp 
	 */
	onTickNPC(timestamp) {
		// TODO
	}

	/**
	 * **Portal** Server update tick callback. Used to do animations etc.
	 * @param {number} timestamp 
	 */
	onTickPortal(timestamp) {
		try {
			// Finds entities in the given radius around the entity
			// and teleports them to the next map
			const nearbyEntities = findMapEntitiesInRadius(this.map, this.entity.lastX, this.entity.lastY, 4)
				.filter(entity => entity.gid !== this.entity.gid) // exclude the portal itself

			if (nearbyEntities.length === 0) return

			for (const entity of nearbyEntities) {
				// only players can be warped
				if (entity.type === ENTITY_TYPE.PLAYER) {
					// @ts-ignore player use portal again 5 seconds after last portal used
					if (timestamp > entity.control._portalUseCd) {
						// @ts-ignore warp player
						entity.control._portalUseCd = timestamp + 5000
						// @ts-ignore entity type is player
						this.map.world.joinMapByName(entity, this.entity.portalName, this.entity.portalX, this.entity.portalY)
					}
				}
			}
		} catch (error) {
			console.error(`${this.constructor.name} ${this.entity.gid} error:`, error.message || error || '[no-code]');
		}
	}

	/**
	 * Handles the movement of the player based on WebSocket messages.
	 * The `code` property of the message is used to determine the direction of the movement.
	 * The player is moved if the direction is valid and the movement timer has expired.
	 * The movement is based on the player's direction and current speed.
	 * Updates the player's position on the map while ensuring it stays within boundaries.
	 * The movement is constrained by a delay calculated from speed and speedMultiplier.
	 *
	 * @param {{code:string}} json - WebSocket message containing the movement information.
	 */
	onMove(json) {
		const timestamp = performance.now()
		this.stopFollow()
		switch (json.code) {
			case "KeyA":
			case "ArrowLeft":
				this.move(0, timestamp)
				break
			case "KeyD":
			case "ArrowRight":
				this.move(1, timestamp)
				break
			case "KeyW":
			case "ArrowUp":
				this.move(2, timestamp)
				break
			case "KeyS":
			case "ArrowDown":
				this.move(3, timestamp)
				break
			default:
				break
		}
	}

	/**
	 * Handles the chat message received from the player.
	 * Constructs a chat packet and sends it to the appropriate recipient.
	 * If the recipient is specified as 'world' or empty, broadcasts the message
	 * to all players in the world. Otherwise, attempts to find the specific player
	 * and send the message to them directly.
	 *
	 * @param {import("../Packets.js").TChatPacket} json - The JSON object containing chat details.
	 */
	onChat(json) {
		if (json.message === "") return;
		const packet = Packets.updateChat(json.channel, this.entity.name, json.to, json.message);
		if (json.channel === '' || json.channel === 'default') {
			this.world.broadcast(JSON.stringify(packet));
		} else {
			// find player name from world then send message to that player
			this.world.maps.forEach((map) => {
				map.entities.forEach((entity) => {
					if (entity.name === json.to && entity.type === ENTITY_TYPE.PLAYER) {
						// @ts-ignore
						entity.control.socket.send(JSON.stringify(packet));
					}
					// TODO send failed message, when player was not found?
				})
			})
		}
	}

	/**
	 * Handles the click event on the map from the player.
	 * If an entity is found within a 4-cell radius, interact with the entity.
	 * If the entity is a monster, reduce its HP by 1.
	 * If the entity is a player, log a message.
	 * If the entity is an NPC, log a message.
	 * @param {Object} json - The JSON object containing click coordinates.
	 * @param {number} json.x - The x-coordinate of the click.
	 * @param {number} json.y - The y-coordinate of the click.
	 */
	onClickPosition(json) {
		if (this.entity.hp <= 0) return // must be alive
		const timestamp = performance.now()
		this.stopFollow()

		// check if player is in range of entity
		// find entities at clicked position in 4-cell radius
		findMapEntitiesInRadius(this.map, json.x, json.y, 4).forEach((entity) => {
			if (entity.gid === this.entity.gid) {
				// don't target self
			}
			else if (entity.type === ENTITY_TYPE.MONSTER && entity.hp > 0) {
				this.attack(entity, timestamp)
				// TODO send update packet?
				// console.log(`Player ${this.name} is attacking Monster ${entity.name} (${entity.hp}/${entity.hpMax}) ${json.x},${json.y}`)
				// this.socket.send(JSON.stringify(Packets.updateEntity(entity)))
			}
			else if (entity.type === ENTITY_TYPE.NPC) {
				this.follow(entity, timestamp)
				this.onTouch(entity, timestamp)
			}
			else if (entity.type === ENTITY_TYPE.PORTAL) {
				// optional, move to the entity
				this.follow(entity, timestamp)
			}
			else if (entity.type === ENTITY_TYPE.PLAYER) {
				// TODO
				console.log(`Player ${this.entity.name} is interacting with Player (${entity.name} ${json.x},${json.y})`)
			}
		})
	}

	/**
	 * when player touches the NPC send the dialog to the player in socket as message
	 * and make sure the player is nearby the NPC, when interacting with the NPC.
	 * Player can't move while interacting with the NPC
	 * 
	 * @param {import("../model/Entity.js").Entity} target 
	 * @param {number} timestamp `performance.now()` when the player starts interacting
	 */
	onTouch(target, timestamp) {
		if (!entityInRangeOfEntity(this.entity, target)) {
			console.log(`Player ${this.entity.name} is not in range of NPC (${target.name} ${target.lastX},${target.lastY})`)
			return
		}
		console.log(`Player ${this.entity.name} started interacting with NPC (${target.name} ${target.lastX},${target.lastY})`)
		this._canMove = false
		this.socket.send(JSON.stringify(Packets.updateNPCDialog(target.gid, target.dialog)))
	}

	/**
	 * Handles the close event on the NPC dialog from the player.
	 * Player stopped interacting with the NPC.
	 * 
	 * @param {{type:string,gid:string}} data
	 */
	onNPCDialogClose(data) {
		console.log(`Player ${this.entity.name} stopped interacting with NPC (gid:${data.gid})`)
		this._canMove = true
	}

	/**
	 * Called when the player enters a map.
	 * @param {import("../maps/WorldMap.js").WorldMap} map - The map the player is entering
	 */
	onEnterMap(map) {
		this.map = map
		console.log(`Player ${this.entity.id} entered ${map.name} map.`)
		// Note: this is also send in onTick
		// send packet to client, containing player data
		this.socket.send(JSON.stringify(Packets.updatePlayer(this.entity)));
	}

	/**
	 * Finds entities in the range of the entity and starts auto-attacking them.
	 * 
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	nearbyAutoAttack(timestamp) {
		try {
			const nearbyEntities = findMapEntitiesInRadius(this.map, this.entity.lastX, this.entity.lastY, this.entity.range)
				.filter(entity => entity.gid !== this.entity.gid) // exclude self

			// no entities in radius
			if (nearbyEntities.length === 0) {
				this._attacking = null
				return
			}

			for (const entity of nearbyEntities) {
				// Monster interaction, player needs to be in range
				if (entity.type === ENTITY_TYPE.MONSTER) {
					// has target set and still in range?
					// then start combat
					if (this._attacking != null || this._follow != null) {
						this.attack(this._attacking || this._follow, timestamp)
					}
				}
			}
		} catch (error) {
			console.error(`${this.constructor.name} ${this.entity.gid} error:`, error.message || error || '[no-code]');
		}
	}

	/**
	 * Moves the entity in the specified direction if possible.
	 * The movement is based on the entity's direction and current speed.
	 * Updates the entity's position on the map while ensuring it stays within boundaries.
	 * The movement is constrained by a delay calculated from speed and speedMultiplier.
	 * 
	 * @param {number} dir - The direction to move the entity:
	 *   0: Left (x--), 1: Right (x++), 2: Up (y--), 3: Down (y++)
	 * @param {number} timestamp - The current timestamp or performance.now().
	 */
	move(dir, timestamp) {
		// this._follow = null // stop following
		if (!this._canMove) return // can't move
		if (this.entity.hp <= 0) return // must be alive

		// check if entity can move on this tick
		if (timestamp < this._moveCd) {
			return // can't move yet
		}
		this._moveCd = timestamp + (this.entity.speed * this.entity.speedMultiplier)

		switch (dir) {
			case DIRECTION.LEFT:
				this.entity.dir = DIRECTION.LEFT
				if (this.entity.lastX > 0) {
					this.entity.lastX--
				}
				break
			case DIRECTION.RIGHT:
				this.entity.dir = DIRECTION.RIGHT
				if (this.entity.lastX < this.map.width) {
					this.entity.lastX++
				}
				break
			case DIRECTION.UP:
				this.entity.dir = DIRECTION.UP
				if (this.entity.lastY > 0) {
					this.entity.lastY--
				}
				break
			case DIRECTION.DOWN:
				this.entity.dir = DIRECTION.DOWN
				if (this.entity.lastY < this.map.height) {
					this.entity.lastY++
				}
				break
			default:
				break
		}
	}

	/**
	 * Start attacking the target entity.
	 * 
	 * @param {import("../model/Entity.js").Entity} entity - The target entity to attack.
	 * @param {number} timestamp - The current timestamp in milliseconds.
	 */
	attack(entity, timestamp) {
		if (entity.type === ENTITY_TYPE.NPC) return // NPC can't be attacked
		if (entity.type === ENTITY_TYPE.PORTAL) return // PORTAL can't be attacked
		if (entity.hp <= 0) return // must be alive

		this._attacking = entity // set target
		this._follow = entity // start to follow
		// entity last attacked time is set, and not ready to attack yet
		// aspd = attack speed. default 1000ms = 1 second
		// aspdMultiplier = attack speed multiplier. default 1.0
		if (timestamp < this._attackAutoCd) {
			return // can't attack yet
		}
		if (!entityInRangeOfEntity(entity, this.entity)) {
			return // out of range
		}
		// set auto-attack cooldown as timestamp + aspd * multiplier
		this._attackAutoCd = timestamp + (this.entity.aspd * this.entity.aspdMultiplier)
		// entity take damage from attacker
		entity.control.takeDamageFrom(this.entity)
	}

	/**
	 * Stops the entity from attacking and following a target.
	 */
	stopAttack() {
		this._attacking = null
		this._follow = null
	}

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 * Reduces the entity's health points (hp) based on the attacker's
	 * strength, attack power, and attack multiplier. If the entity's hp
	 * falls to zero or below, the entity dies and is removed from the map.
	 * 
	 * @param {import("../model/Entity.js").Entity} attacker - The attacking entity
	 *        attributes such as strength (str), attack
	 *        power (atk), and attack multiplier (atkMultiplier).
	 */
	takeDamageFrom(attacker) {
		if (this.entity.type === ENTITY_TYPE.NPC) return // NPC can't take damage
		if (this.entity.type === ENTITY_TYPE.PORTAL) return // PORTAL can't take damage
		if (this.entity.hp <= 0) return // must be alive
		// must be in the same map, to receive damage
		if (this.map !== attacker.control.map) {
			return
		}

		// physical attacks are always neutral? what about weapons elements?
		// TODO take defence into account
		if (attacker.eAtk === ELEMENT.NEUTRAL) {
			this.entity.hp -= (attacker.str + attacker.atk) * attacker.atkMultiplier;
		} else {
			this.entity.hp -= (attacker.int + attacker.mAtk) * attacker.mAtkMultiplier;
		}

		if (this.entity.hp <= 0) {
			this.die(attacker)
		}
	}

	/**
	 * When player dies, send them to saved position and map
	 * @param {import("../model/Entity.js").Entity} attacker - The attacking entity
	 */
	die(attacker) {
		if (this.entity.type === ENTITY_TYPE.NPC) return // NPC can't die
		if (this.entity.type === ENTITY_TYPE.PORTAL) return // PORTAL can't die
		this.entity.hp = 0
		this.entity.mp = 0
		this.entity.death = performance.now() // Date.now()

		this._attacking = null
		this._follow = null

		if (this.entity.type === ENTITY_TYPE.PLAYER) {
			this.toSavePosition()
			this.revive()
		}

		// @ts-ignore reward the attacker with exp
		if (attacker.onKill) attacker.onKill(this.entity)
	}

	/**
	 * Reward the player with exp for killing an entity.
	 * @param {import("../model/Entity.js").Entity} entity - The killed entity
	 */
	onKill(entity) {
		let _self = this.entity
		if (_self.type !== ENTITY_TYPE.PLAYER) return // only players can get exp
		_self.baseExp += entity.baseExp
		_self.jobExp += entity.jobExp
		const expTable = EXP_TABLE[_self.level]
		if (expTable != null) {
			// base level up +1
			if (_self.baseExp >= expTable.base) {
				_self.level++
				_self.baseExp = 0
				// TODO stats increment table, by level?
				_self.hpMax += 100
				_self.hp = Number(_self.hpMax) // heal 100%
				_self.mpMax += 50
				_self.mp = Number(_self.mpMax) // heal 100%
				_self.atk += 5
				_self.str += 5
				_self.agi += 5
				_self.int += 5
				_self.vit += 5
				_self.dex += 5
				_self.luk += 5
				_self.def += 1
				_self.mDef += 1
				// _self.atkMultiplier = _self.atkMultiplier * _self.level
			}
			// job level up +1
			if (_self.jobExp >= expTable.job) {
				_self.jobLevel++
				_self.jobExp = 0
			}
		}
		// TODO money rewards?
		// console.log(`Rewarded the "${_self.name} (${_self.level})" with exp: ${entity.baseExp}/${entity.jobExp}`)
	}

	/**
	 * Revives the entity by restoring their health points (hp) and
	 * mana points (mp) to their maximum values (hpMax and mpMax).
	 */
	revive() {
		this.entity.hp = Number(this.entity.hpMax)
		this.entity.mp = Number(this.entity.mpMax)
	}

	/**
	 * Moves the entity to their saved map and position.
	 */
	toSavePosition() {
		// same map, just update position
		if (this.map.name === this.entity.saveMap) {
			this.lastX = this.entity.saveX
			this.lastY = this.entity.saveY
			return
		}
		// different map, join
		if (this.entity.type === ENTITY_TYPE.PLAYER) {
			this.map.world.joinMapByName(this.entity, this.entity.saveMap, this.entity.saveX, this.entity.saveY)
		}
	}

	/**
	 * Makes the entity follow another entity, by moving its position on each tick
	 * closer to the target entity. The target must be in the range.
	 * If the target moves out of range or dies, then stop following.
	 * @param {import("../model/Entity.js").Entity} entity - The target entity to follow.
	 * @param {number} timestamp - The current timestamp or performance.now().
	 */
	follow(entity, timestamp) {
		if (!this._canMove) return // can't move
		if (this.entity.hp <= 0) return // must be alive
		this._follow = entity

		// check if entity can move on this tick
		if (timestamp < this._moveCd) {
			return // can't move yet
		}
		// set move cooldown as timestamp + speed * multiplier
		this._moveCd = timestamp + (this.entity.speed * this.entity.speedMultiplier)

		// if target dies, stop following
		if (entity.hp <= 0) {
			this._follow = null
			return
		}

		// stop at range
		if (entityInRangeOfEntity(this.entity, entity)) {
			this._follow = null
			return
		}

		// follow entity
		if (this.entity.lastX > entity.lastX) {
			this.entity.dir = DIRECTION.LEFT
			this.entity.lastX--
		} else if (this.entity.lastX < entity.lastX) {
			this.entity.dir = DIRECTION.RIGHT
			this.entity.lastX++
		}
		if (this.entity.lastY > entity.lastY) {
			this.entity.dir = DIRECTION.UP
			this.entity.lastY--
		} else if (this.entity.lastY < entity.lastY) {
			this.entity.dir = DIRECTION.DOWN
			this.entity.lastY++
		}
	}

	stopFollow() {
		this._follow = null
	}
}