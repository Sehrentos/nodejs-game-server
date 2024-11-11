import { randomBytes } from 'node:crypto';
import { Player } from '../model/Player.js';
import * as Packets from '../Packets.js';
import { ENTITY_TYPE } from '../enum/Entity.js';
import { ELEMENT } from '../enum/Element.js';
import { inRangeOfEntity } from '../utils/EntityUtil.js';

/**
 * @typedef {import("../WorldMap.js").WorldMap} WorldMap
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
			// console.log(`WS ${process.pid} message:`, json);
			// we changed the login into Bearer header
			// don't login here
			// if (json.type === 'login') {
			// 	await this.onLogin(json)
			// } else 
			if (json.type === 'move') {
				this.onMove(json)
			} else if (json.type === 'chat') {
				this.onChat(json)
			} else if (json.type === 'click') {
				this.onClickPosition(json)
			}
			else {
				console.log(`[TODO] ${process.pid} message:`, json)
			}
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
	 * Function to handle the movement of a monster entity on each tick.
	 * It checks if the entity can move, updates its position based on speed and direction,
	 * and ensures it stays within the map boundaries and doesn't move excessively from the original position.
	 * 
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	onTick(timestamp) {
		// const deltaTime = timestamp - this.world.startTime // ms elapsed, since server started
		// console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)

		// update client map data on server update tick,
		// so the client can update the map with new entity positions
		this.socket.send(JSON.stringify(Packets.updateMap(this.map)));

		// send player update every 5 seconds
		if (!this._playerUpdate || timestamp - this._playerUpdate > 5000) {
			this._playerUpdate = timestamp
			// send packet to client, containing player data
			this.socket.send(JSON.stringify(Packets.updatePlayer(this)));
		}

		// check if player is alive, for the rest of the function
		if (this.hp <= 0) return

		// find entities in nearby
		this.detectNearByEntities(10, timestamp)

		// start following target
		if (this._following != null) {
			this.follow(this._following)
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
		if (this.hp <= 0) return // must be alive
		const _timestamp = timestamp || performance.now()

		// check if entity can move on this tick
		if (this.movementStart === 0) {
			// can move
		} else if (_timestamp - this.movementStart < this.speed * this.speedMultiplier) {
			return
		}
		this.movementStart = _timestamp

		switch (dir) {
			case 0:
				this.dir = 0
				if (this.x > 0) {
					this.x--
				}
				break
			case 1:
				this.dir = 1
				if (this.x < this.map.width) {
					this.x++
				}
				break
			case 2:
				this.dir = 2
				if (this.y > 0) {
					this.y--
				}
				break
			case 3:
				this.dir = 3
				if (this.y < this.map.height) {
					this.y++
				}
				break
			default:
				break
		}
	}

	/**
	 * Makes the entity follow another entity, by moving its position on each tick
	 * closer to the target entity. The target must be in the monster's range.
	 * If the target moves out of range or dies, the monster will stop following.
	 * @param {import("../model/Entity").TEntityProps} entity - The target entity to follow.
	 * @returns {string} - Returns "out of range" if the target is out of range.
	 */
	follow(entity) {
		if (this.hp <= 0) return // must be alive

		this._following = entity

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

		// follow target
		if (this.x > entity.x) {
			this.dir = 0
			this.x--
		} else if (this.x < entity.x) {
			this.dir = 1
			this.x++
		}
		if (this.y > entity.y) {
			this.dir = 2
			this.y--
		} else if (this.y < entity.y) {
			this.dir = 3
			this.y++
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

		// TODO check if player is in range of entity (20-cell radius)
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
				this.follow(entity)
			}
			else if (entity.type === ENTITY_TYPE.PLAYER) {
				// TODO
				console.log(`Player ${this.name} is interacting with Player (${entity.name} ${json.x},${json.y})`)
			}
		})
	}

	/**
	 * Called when the player enters a map.
	 * @param {WorldMap} map - The map the player is entering
	 */
	onEnterMap(map) {
		this.map = map
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
				if (entity.type === ENTITY_TYPE.MONSTER) {
					// has target set and still in range?
					// then start combat
					if (this.attacking != null || this._following != null) {
						// @ts-ignore
						this.attack(this.attacking || this._following, timestamp)
					}
				}
				if (entity.type === ENTITY_TYPE.NPC) {
					this.nearByNPC.set(entity.gid, entity)
				}
			}
		} catch (error) {
			console.error(`${this.constructor.name} ${this.gid} error:`, error.message || error || '[no-code]');
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

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 * Reduces the entity's health points (hp) based on the attacker's
	 * strength, attack power, and attack multiplier. If the entity's hp
	 * falls to zero or below, the entity dies and is removed from the map.
	 * 
	 * @param {import("./MonsterControl.js").MonsterControl|import("./PlayerControl.js").PlayerControl} attacker - The attacking entity, containing attack
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
			this.die()
		}
	}

	/**
	 * When player dies, send them to saved position and map
	 */
	die() {
		this.hp = 0
		this.death = performance.now() // Date.now()
		this.attacking = null
		this._following = null
		this.toSavePosition()
		this.revive()
	}

	revive() {
		this.hp += this.hpMax
		this.mp += this.mpMax
	}

	toSavePosition() {
		this.map.world.joinMapByName(this, this.saveMap, this.saveX, this.saveY)
	}
}