import { randomBytes } from 'node:crypto';
import { Player } from '../model/Player.js';
import * as Packets from '../Packets.js';
import { ENTITY_TYPE } from '../enum/Entity.js';
import { ELEMENT } from '../enum/Element.js';

/**
 * @typedef {import("../WorldMap.js").WorldMap} WorldMap
 * @typedef {import("../model/Player.js").PlayerProps} PlayerProps
 * @typedef {Object} PlayerExtraProps
 * @prop {import("../World.js").World=} world - World instance.
 * @prop {import("ws").WebSocket=} socket - Websocket instance.
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
		this.aspd = p?.aspd ?? 1000
		this.aspdMultiplier = p?.aspdMultiplier ?? 1

		/** @type {number} timestamp in milliseconds when the player last attacked */
		this.attackStart = 0
		/** @type {import("./EntityControl.js").TEntityControls|null} */
		this.attacking = null

		this.saveMap = p?.saveMap ?? 'Lobby town'
		this.saveX = p?.saveX ?? 300
		this.saveY = p?.saveY ?? 200

		this.world = p?.world ?? null
		this.socket = p?.socket ?? null

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
				await this.onMove(json)
			} else if (json.type === 'chat') {
				await this.onChat(json)
			} else if (json.type === 'click') {
				await this.onClickPosition(json)
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

		// find entities in nearby
		this.detectNearByEntities(10, timestamp)
	}

	// async onLogin(json) {
	// 	// TODO validate username
	// 	this.name = json.username
	// 	const map = await this.world.joinMap(this, 'Lobby town')
	// 	console.log(`Player ${this.id} joined ${map.name}`)
	// 	this.onEnterMap(map)
	// 	return true
	// }

	async onMove(json) {
		const timestamp = performance.now()

		// apply position update from player.speed and player.speedMultiplier
		if (this.movementStart === 0) {
			// this.movementStart = timestamp
		} else if (timestamp - this.movementStart < this.speed * this.speedMultiplier) {
			return
		}
		this.movementStart = timestamp

		switch (json.code) {
			case "KeyA":
			case "ArrowLeft":
				this.dir = 0
				if (this.x > 0) {
					this.x--
				}
				break
			case "KeyD":
			case "ArrowRight":
				this.dir = 1
				if (this.x < this.map.width) {
					this.x++
				}
				break
			case "KeyW":
			case "ArrowUp":
				this.dir = 2
				if (this.y > 0) {
					this.y--
				}
				break
			case "KeyS":
			case "ArrowDown":
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
	 * Handles the chat message received from the player.
	 * Constructs a chat packet and sends it to the appropriate recipient.
	 * If the recipient is specified as 'world' or empty, broadcasts the message
	 * to all players in the world. Otherwise, attempts to find the specific player
	 * and send the message to them directly.
	 *
	 * @param {Object} json - The JSON object containing chat details.
	 * @param {string} json.to - The recipient player's name or 'world' for broadcasting.
	 * @param {string} json.message - The chat message content.
	 */
	onChat(json) {
		if (json.message === "") return;
		const packet = Packets.updateChat(this.name, json.to, json.message)
		if (json.to === '' || json.to === 'world') {
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
			else if (entity.type === ENTITY_TYPE.PLAYER) {
				// TODO
				console.log(`Player ${this.name} is interacting with Player (${entity.name} ${json.x},${json.y})`)
			}
			else if (entity.type === ENTITY_TYPE.NPC) {
				// TODO
				console.log(`Player ${this.name} is interacting with NPC (${entity.name} ${json.x},${json.y})`)
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
	 * @param {number} [radius=4] - The radius to search for entities.
	 * @param {number} [timestamp=performance.now()] `performance.now()` from the world.onTick
	 */
	detectNearByEntities(radius = 4, timestamp = performance.now()) {
		try {
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
					if (this.attacking != null) {
						this.attack(this.attacking, timestamp)
					}
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
		if (this.attackStart !== 0 && timestamp - this.attackStart < this.aspd * this.aspdMultiplier) {
			return // can't attack yet
		}
		this.attackStart = timestamp
		this.attacking = entity

		// @ts-ignore null checked. perform attack
		entity?.takeDamage(this)
	}

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 * Reduces the entity's health points (hp) based on the attacker's
	 * strength, attack power, and attack multiplier. If the entity's hp
	 * falls to zero or below, the entity dies and is removed from the map.
	 * 
	 * @param {import("./EntityControl.js").TEntityControls} attacker - The attacking entity, containing attack
	 *        attributes such as strength (str), attack
	 *        power (atk), and attack multiplier (atkMultiplier).
	 */
	takeDamage(attacker) {
		// must be in the same map, to receive damage
		if (this.map !== attacker.map) {
			return
		}
		if (this.hp > 0) {
			// physical attacks are always neutral? what about weapons elements?
			// TODO take defence into account
			if (attacker.elementAtk === ELEMENT.NEUTRAL) {
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
	 * Removes the entity from the map.
	 */
	die() {
		// TODO handle player removal differently, eg. send them to saved position and map
		// this.map.removeEntity(this)
		this.goToSavedPosition()
		this.revive()
	}

	revive() {
		this.hp += this.hpMax
		this.mp += this.mpMax
	}

	goToSavedPosition() {
		this.map.world.joinMapByName(this, this.saveMap, this.saveX, this.saveY)
	}
}