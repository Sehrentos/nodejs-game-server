import { randomBytes } from 'node:crypto';
import { Player } from '../model/Player.js';
import * as Packets from '../Packets.js';
import { DIRECTION, ENTITY_TYPE } from '../enum/Entity.js';
import { ELEMENT } from '../enum/Element.js';
import { inRangeOfEntity } from '../utils/EntityUtil.js';
import { EXP_TABLE } from '../data/EXP_TABLE.js';

/**
 * @typedef {import("../maps/WorldMap.js").WorldMap} WorldMap
 * @typedef {import("../model/Player.js").TPlayerProps} PlayerProps
 * @typedef {Object} PlayerExtraProps
 * @prop {import("../World.js").World=} world - World instance.
 * @prop {import("ws").WebSocket=} socket - Websocket instance.
 * @prop {Map<number, import("./NPCControl.js").NPCControl>=} nearByNPC - List of nearby NPCs.
 * 
 * @typedef {PlayerProps & PlayerExtraProps} PlayerControlProps
 */

export class PlayerControl extends Player {
	/**
	 * Creates a new PlayerControl instance.
	 * @param {PlayerControlProps} p - Entity properties.
	 */
	constructor(p) {
		super(p)
		this.gid = p?.gid ?? randomBytes(4).toString('hex')

		this.speed = 1 // DEBUG, make player move really fast
		this.range = 10 // DEBUG, make player attack range longer
		this._following = null

		// set default town and position
		this.saveMap = p?.saveMap ?? 'Lobby town'
		this.saveX = p?.saveX ?? 300
		this.saveY = p?.saveY ?? 200

		this.world = p?.world ?? null
		this.socket = p?.socket ?? null
		this.nearByNPC = new Map()

		this._onClose = this.onClose.bind(this)
		this._onError = this.onError.bind(this)
		this._onMessage = this.onMessage.bind(this)

		this.socket.on('close', this._onClose)
		this.socket.on('error', this._onError)
		this.socket.on('message', this._onMessage)
	}

	/**
	 * Called when a new WebSocket message is received from the player
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

	onClose() {
		console.log(`Player ${process.pid} connection closed.`);
		this.socket.off('close', this._onClose)
		this.socket.off('error', this._onError)
		this.socket.off('message', this._onMessage)
		this.world.onClientClose(this)
	}

	onError(error) {
		console.log(`WS ${process.pid} error:`, error.message || error || '[no-code]');
	}

	broadcast(data, isBinary = false) {
		this.world.broadcast(data, isBinary)
	}

	/**
	 * Server update tick callback. Used to send updates to the client.
	 * 
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	onTick(timestamp) {
		// update client map data on server update tick,
		// so the client can update the map with new entity positions
		this.socket.send(JSON.stringify(Packets.updateMap(this.map)));

		// send full player state update every 5 seconds
		if (!this._playerUpdate || timestamp - this._playerUpdate > 5000) {
			this._playerUpdate = timestamp
			// send packet to client, containing player data
			this.socket.send(JSON.stringify(Packets.updatePlayer(this)));
		}

		// TODO implement other player updates, like stats that needs to be more frequent?
		// skills, equipment, inventory, quests for example, does not need to be updated so frequently.

		// check if player is alive, for the rest of the function
		if (this.hp <= 0) return

		// find entities in nearby
		this.detectNearByEntities(10, timestamp)

		// start following target
		if (this._following != null) {
			this.follow(this._following, timestamp)
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
		const packet = Packets.updateChat(json.channel, this.name, json.to, json.message);
		if (json.channel === '' || json.channel === 'default') {
			this.world.broadcast(JSON.stringify(packet));
		} else {
			// find player name from world then send message to that player
			this.world.maps.forEach((map) => {
				map.entities.forEach((entity) => {
					if (entity.name === json.to && entity.type === ENTITY_TYPE.PLAYER) {
						// @ts-ignore
						entity.socket.send(JSON.stringify(packet));
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
		if (this.hp <= 0) return // must be alive
		const timestamp = performance.now()
		this._following = null // stop following

		// check if player is in range of entity
		// find entities at clicked position in 4-cell radius
		this.map.findEntitiesInRadius(json.x, json.y, 4).forEach((entity) => {
			if (entity.type === ENTITY_TYPE.MONSTER && entity.hp > 0) {
				this.attack(entity, timestamp)
				// TODO send update packet?
				// console.log(`Player ${this.name} is attacking Monster ${entity.name} (${entity.hp}/${entity.hpMax}) ${json.x},${json.y}`)
				// this.socket.send(JSON.stringify(Packets.updateEntity(entity)))
			}
			else if (entity.type === ENTITY_TYPE.NPC) {
				// @ts-ignore type NPC
				entity.onTouch(this, timestamp)
				// optional, move to the entity
				this.follow(entity, timestamp)
			}
			else if (entity.type === ENTITY_TYPE.WARP_PORTAL) {
				// optional, move to the entity
				this.follow(entity, timestamp)
			}
			else if (entity.type === ENTITY_TYPE.PLAYER) {
				// TODO
				console.log(`Player ${this.name} is interacting with Player (${entity.name} ${json.x},${json.y})`)
			}
		})
	}

	/**
	 * Handles the close event on the NPC dialog from the player.
	 * @param {{type:string,gid:string}} data
	 */
	onNPCDialogClose(data) {
		/** @type {import("./NPCControl").NPCControl} */
		const npc = this.nearByNPC.get(data.gid)
		if (!npc) return console.log(`NPCDialogClose: NPC (${data.gid}) not found. player: "${this.name}" is not near the NPC.`)
		npc.onCloseDialog(this, performance.now())
	}

	/**
	 * Called when the player enters a map.
	 * @param {WorldMap} map - The map the player is entering
	 */
	onEnterMap(map) {
		this.map = map
		console.log(`Player ${this.id} entered ${map.name} map.`)
		// Note: this is also send in onTick
		// send packet to client, containing player data
		this.socket.send(JSON.stringify(Packets.updatePlayer(this)));
	}

	/**
	 * Finds entities in the given radius around the entity.
	 * @param {number} radius - The radius to search for entities.
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	detectNearByEntities(radius, timestamp) {
		try {
			// clear old entities
			this.nearByNPC.clear()

			const nearbyEntities = this.map.findEntitiesInRadius(this.x, this.y, radius)
				.filter(entity => entity.gid !== this.gid) // exclude self

			// no entities in radius
			if (nearbyEntities.length === 0) {
				this.attacking = null
				return
			}

			for (const entity of nearbyEntities) {
				// Monster interaction, player needs to be in range
				if (entity.type === ENTITY_TYPE.MONSTER) {
					// has target set and still in range?
					// then start combat
					if (this.attacking != null || this._following != null) {
						// @ts-ignore
						this.attack(this.attacking || this._following, timestamp)
					}
				}
				// NPC interaction, player needs to be in range
				if (entity.type === ENTITY_TYPE.NPC) {
					this.nearByNPC.set(entity.gid, entity)
				}
			}
		} catch (error) {
			console.error(`${this.constructor.name} ${this.gid} error:`, error.message || error || '[no-code]');
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
	 * @param {number=} timestamp - The current timestamp or performance.now().
	 */
	move(dir, timestamp) {
		this._following = null // stop following
		if (!this.canMove) return // can't move
		if (this.hp <= 0) return // must be alive
		const _timestamp = timestamp || performance.now()

		// check if entity can move on this tick
		if (typeof this.movementStart === "number" && _timestamp - this.movementStart < this.speed * this.speedMultiplier) {
			return // can't move yet
		}
		this.movementStart = _timestamp

		switch (dir) {
			case DIRECTION.LEFT:
				this.dir = DIRECTION.LEFT
				if (this.x > 0) {
					this.x--
				}
				break
			case DIRECTION.RIGHT:
				this.dir = DIRECTION.RIGHT
				if (this.x < this.map.width) {
					this.x++
				}
				break
			case DIRECTION.UP:
				this.dir = DIRECTION.UP
				if (this.y > 0) {
					this.y--
				}
				break
			case DIRECTION.DOWN:
				this.dir = DIRECTION.DOWN
				if (this.y < this.map.height) {
					this.y++
				}
				break
			default:
				break
		}
	}

	/**
	 * Controls the attack logic of the entity.
	 * 
	 * @param {import("./EntityControl.js").TEntityControls} entity - The target entity to attack.
	 * @param {number} timestamp - The current timestamp in milliseconds.
	 */
	attack(entity, timestamp) {
		if (this.hp <= 0) return // must be alive

		this.attacking = entity // set target
		this._following = entity // start to follow

		if (this.attackStart !== 0 && timestamp - this.attackStart < this.aspd * this.aspdMultiplier) {
			return // can't attack yet
		}
		// is in melee range
		if (!inRangeOfEntity(entity, this.x, this.y, this.range)) {
			return
		}
		this.attackStart = timestamp

		entity.takeDamage(this)
	}

	stopAttack() {
		this.attacking = null
	}

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 * Reduces the entity's health points (hp) based on the attacker's
	 * strength, attack power, and attack multiplier. If the entity's hp
	 * falls to zero or below, the entity dies and is removed from the map.
	 * 
	 * @param {import("./MonsterControl.js").MonsterControl|import("./PlayerControl.js").PlayerControl} attacker - The attacking entity
	 *        attributes such as strength (str), attack
	 *        power (atk), and attack multiplier (atkMultiplier).
	 */
	takeDamage(attacker) {
		if (this.hp <= 0) return // must be alive
		// must be in the same map, to receive damage
		if (this.map !== attacker.map) {
			return
		}
		if (this.hp > 0) {
			// physical attacks are always neutral? what about weapons elements?
			// TODO take defence into account
			if (attacker.eAtk === ELEMENT.NEUTRAL) {
				this.hp -= (attacker.str + attacker.atk) * attacker.atkMultiplier;
			} else {
				this.hp -= (attacker.int + attacker.mAtk) * attacker.mAtkMultiplier;
			}
		}
		if (this.hp <= 0) {
			this.die(attacker)
		}
	}

	/**
	 * When player dies, send them to saved position and map
	 * @param {import("./MonsterControl").MonsterControl | import("./PlayerControl").PlayerControl} attacker - The attacking entity
	 */
	die(attacker) {
		this.hp = 0
		this.mp = 0
		this.death = performance.now() // Date.now()
		this.attacking = null
		this._following = null
		this.toSavePosition()
		this.revive()

		// @ts-ignore reward the attacker with exp
		if (attacker.onKill) attacker.onKill(this)
	}

	/**
	 * Reward the player with exp for killing an entity.
	 * @param {import("./MonsterControl").MonsterControl | import("./PlayerControl").PlayerControl} entity - The killed entity
	 */
	onKill(entity) {
		this.baseExp += entity.baseExp
		this.jobExp += entity.jobExp
		const expTable = EXP_TABLE[this.level]
		if (expTable != null) {
			// base level up +1
			if (this.baseExp >= expTable.base) {
				this.level++
				this.baseExp = 0
				// TODO stats increment table, by level?
				this.hpMax += 100
				this.hp = Number(this.hpMax) // heal 100%
				this.mpMax += 50
				this.mp = Number(this.mpMax) // heal 100%
				this.atk += 5
				this.str += 5
				this.agi += 5
				this.int += 5
				this.vit += 5
				this.dex += 5
				this.luk += 5
				this.def += 1
				this.mDef += 1
				// this.atkMultiplier = this.atkMultiplier * this.level
			}
			// job level up +1
			if (this.jobExp >= expTable.job) {
				this.jobLevel++
				this.jobExp = 0
			}
		}
		// TODO money rewards?
		// console.log(`Rewarded the "${this.name} (${this.level})" with exp: ${entity.baseExp}/${entity.jobExp}`)
	}

	/**
	 * Revives the entity by restoring their health points (hp) and
	 * mana points (mp) to their maximum values (hpMax and mpMax).
	 */
	revive() {
		this.hp = Number(this.hpMax)
		this.mp = Number(this.mpMax)
	}

	/**
	 * Moves the entity to their saved map and position.
	 */
	toSavePosition() {
		// same map, just set position
		if (this.map.name === this.saveMap) {
			this.x = this.saveX
			this.y = this.saveY
			return
		}
		// different map, join
		this.map.world.joinMapByName(this, this.saveMap, this.saveX, this.saveY)
	}

	/**
	 * Makes the entity follow another entity, by moving its position on each tick
	 * closer to the target entity. The target must be in the range.
	 * If the target moves out of range or dies, then stop following.
	 * @param {import("../model/Entity").TEntityProps} entity - The target entity to follow.
	 * @param {number=} timestamp - The current timestamp or performance.now().
	 */
	follow(entity, timestamp) {
		if (!this.canMove) return // can't move
		if (this.hp <= 0) return // must be alive
		const _timestamp = timestamp || performance.now()
		this._following = entity

		// check if entity can move on this tick
		if (typeof this.movementStart === "number" && _timestamp - this.movementStart < this.speed * this.speedMultiplier) {
			return // can't move yet
		}
		this.movementStart = _timestamp

		// if target dies, stop following
		if (entity.hp <= 0) {
			this._following = null
			return
		}

		// stop at range
		if (inRangeOfEntity(entity, this.x, this.y, this.range)) {
			this._following = null
			return
		}

		// follow entity
		if (this.x > entity.x) {
			this.dir = DIRECTION.LEFT
			this.x--
		} else if (this.x < entity.x) {
			this.dir = DIRECTION.RIGHT
			this.x++
		}
		if (this.y > entity.y) {
			this.dir = DIRECTION.UP
			this.y--
		} else if (this.y < entity.y) {
			this.dir = DIRECTION.DOWN
			this.y++
		}
	}

	stopFollowing() {
		this._following = null
	}
}