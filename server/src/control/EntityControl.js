import { AI } from './AI.js';
import { DIR, TYPE } from '../../../shared/enum/Entity.js';
import { ELEMENT } from '../../../shared/enum/Element.js';
import { inRangeOf, inRangeOfEntity, findMapEntitiesInRadius } from "../../../shared/utils/EntityUtils.js";
import { onEntityKill } from '../events/onEntityKill.js';
import RateLimiter from '../utils/RateLimiter.js';
import onEntityPacketChat from '../events/onEntityPacketChat.js';
import onEntityPacketDialog from '../events/onEntityPacketDialog.js';
import onEntityPacketMove from '../events/onEntityPacketMove.js';
// import onEntityPacketPing from '../events/onEntityPacketPing.js';
import onEntityPacketPong from '../events/onEntityPacketPong.js';
import onEntityPacketTouchPosition from '../events/onEntityPacketTouchPosition.js';
import onEntityUpdatePlayer from '../events/onEntityUpdatePlayer.js';
import onEntityUpdateMonster from '../events/onEntityUpdateMonster.js';
import onEntityUpdateNPC from '../events/onEntityUpdateNPC.js';
import onEntityUpdatePortal from '../events/onEntityUpdatePortal.js';
import onEntityUpdatePet from '../events/onEntityUpdatePet.js';
import onEntityPacketLogout from '../events/onEntityPacketLogout.js';
import onEntityEnterMap from '../events/onEntityEnterMap.js';
import onEntityLeaveMap from '../events/onEntityLeaveMap.js';
import onEntitySkill from '../events/onEntitySkill.js';
import Cooldown from '../../../shared/utils/Cooldown.js';
import * as Const from '../../../shared/Constants.js';
import { sendHeartbeat } from '../events/sendHeartbeat.js';
// import { sendRateLimit } from '../events/sendRateLimit.js';
import SkillControl from './SkillControl.js';
import { sendMapEntity, sendMapRemoveEntity } from '../events/sendMap.js';
import { sendPlayerLeave } from '../events/sendPlayerLeave.js';
import { removeEntityFromMaps } from '../actions/entity.js';
import DB from '../db/index.js';

export class EntityControl {
	/**
	 * Creates a new EntityControl instance.
	 * @param {import("../../../shared/models/Entity.js").Entity} entity - The entity to control.
	 * @param {import("../World.js").World} world - The world instance.
	 * @param {import("ws").WebSocket=} socket - The WebSocket instance.
	 * @param {import("../../../shared/models/WorldMap.js").WorldMap=} map - The map instance.
	 */
	constructor(entity, world, socket, map) {
		/** @type {DOMHighResTimeStamp} - Created timestamp */
		this.created = performance.now()

		/** @type {import("../../../shared/models/Entity.js").Entity} - Entity instance */
		this.entity = entity

		/** @type {import("../World.js").World} - World instance */
		this.world = world

		/** @type {import("ws").WebSocket} - Web Socket instance */
		this.socket = socket

		/** @type {import("../../../shared/models/WorldMap.js").WorldMap} - WorldMap instance */
		this.map = map

		/** @type {import("./AI.js").AI|null=} - Monster AI. default null */
		this.ai = entity.type === TYPE.MONSTER ? new AI(entity) : null

		/** @type {import("../../../shared/models/Entity.js").Entity?} - attacking target entity */
		this._attacking = null

		/** @type {import("../../../shared/models/Entity.js").Entity?} following this entity */
		this._follow = null

		/** @type {{x: number, y: number}|null} entity move to position */
		this._moveTo = null

		// #region cooldowns
		this._messageRateLimiter = new RateLimiter(50, 3, 500); // 50ms rate limit, burst of 3 in 500ms
		this._attackAutoCd = new Cooldown()
		this._moveCd = new Cooldown()
		this._socketSentMapUpdateCd = new Cooldown()
		this._socketSentPlayerUpdateCd = new Cooldown()
		this._portalUseCd = new Cooldown()
		this._autoRegenerateHpCd = new Cooldown()
		this._autoRegenerateMpCd = new Cooldown()
		this._skillHealCd = new Cooldown()
		this._skillAttackCd = new Cooldown()
		// #endregion

		// skill controller
		this.skillControl = new SkillControl(entity);

		// bind WebSocket functions for Players
		if (entity.type === TYPE.PLAYER) {
			this._onSocketHeartbeat = setInterval(this.onSocketHeartbeat.bind(this), Const.SOCKET_HEARTBEAT_INTERVAL)
			// periodic player state sync (fallback to 60s if not defined)
			this._onPeriodicSave = setInterval(() => {
				this.syncPlayerToDb().catch(e => console.log(`[${this.constructor.name}] periodic sync error:`, e.message || e))
			}, (Const.PLAYER_AUTO_SAVE_INTERVAL || 60000))
			this._onSocketClose = this.onSocketClose.bind(this)
			this._onSocketError = this.onSocketError.bind(this)
			this._onSocketMessage = this.onSocketMessage.bind(this)

			this.socket.on('close', this._onSocketClose)
			this.socket.on('error', this._onSocketError)
			this.socket.on('message', this._onSocketMessage)
		}
	}

	/**
	 * **Player** Called when a new WebSocket message is received from the player
	 * @param {Buffer|string} data
	 * @param {boolean} isBinary
	 */
	async onSocketMessage(data, isBinary) {
		// check if the message is rate limited
		if (!this._messageRateLimiter.limit()) {
			//console.log(`[${this.constructor.name}] "${this.entity.name}" message rate limited!`);
			// Optionally, send a message back to the client indicating rate limiting
			// this.socket.send(sendRateLimit('Too many requests.'));
			return;
		}
		// check if the message is binary (not JSON)
		if (isBinary) {
			console.log(`[${this.constructor.name}] "${this.entity.name}" sent binary message!`);
			console.log("Binary message is not implemented.");
			return;
		}
		// This code will only execute if the message is NOT rate limited.
		try {
			// @ts-ignore limit the size of the message, player can send to server
			if ((data.length || data.byteLength) > Const.SOCKET_MESSAGE_MAX_SIZE) {
				console.log(`[${this.constructor.name}] "${this.entity.name}" sent too large message!`);
				return;
			}
			const timestamp = performance.now()
			// parse JSON sent from the player
			const json = JSON.parse(data.toString());
			switch (json.type) {
				// case 'ping': onEntityPacketPing(this.entity, json); break;
				case 'pong': onEntityPacketPong(this.entity, json, timestamp); break;
				case 'move': onEntityPacketMove(this.entity, json, timestamp); break;
				case 'chat': onEntityPacketChat(this.entity, json, timestamp); break;
				case 'click': onEntityPacketTouchPosition(this.entity, json, timestamp); break;
				case 'dialog': onEntityPacketDialog(this.entity, json, timestamp); break;
				case 'logout': onEntityPacketLogout(this.entity, json, timestamp); break;
				case 'skill': onEntitySkill(this.entity, json, timestamp); break;
				default:
					console.log(`[${this.constructor.name}] message "${this.entity.name}":`, json)
					break;
			}
		} catch (e) {
			console.log(`[${this.constructor.name}] message "${this.entity.name}" error:`, (e.message || e), data)
		}
	}

	/**
	 * **Player** Called when the player closes the WebSocket connection.
	 */
	async onSocketClose() {
		try {
			const player = this.entity
			const world = player.control.world
			console.log(`[${this.constructor.name}] onSocketClose "${player.name}" connection closed.`);
			clearInterval(this._onSocketHeartbeat) // stop heartbeat (ping/pong)
			// stop periodic save
			if (this._onPeriodicSave) clearInterval(this._onPeriodicSave)
			this.socket.off('close', this._onSocketClose)
			this.socket.off('error', this._onSocketError)
			this.socket.off('message', this._onSocketMessage)
			player.emit('socket.close')
			// this.world.onClientClose(entity)
			// this.world.emit('socket.close', entity)

			if (world.isClosing) return // Skip, server closing process is handled in onExit method

			this.broadcast(sendPlayerLeave(player.name));

			// do logout by setting state=0
			await DB.account.logout(player.aid, false);

			// final sync using centralized method (player + inventory)
			const playerUpdate = await this.syncPlayerToDb()
			console.log(`[World socket.close] (id:${player.id}) "${player.name}" is ${playerUpdate && playerUpdate.id ? 'saved' : 'not saved'}.`)

			// send entity remove packet to other players
			const playerMap = player.control.map
			const playerPets = playerMap.entities.filter(entity => entity.type === TYPE.PET && entity.owner.gid === player.gid)
			for (let other of playerMap.entities) {
				if (other.type === TYPE.PLAYER && other.gid !== player.gid) {
					other.control.socket.send(sendMapRemoveEntity(player, ...playerPets))
				}
			}
			// remove player from map
			// remove player pets from map
			removeEntityFromMaps(player, true)
		} catch (e) {
			console.log(`[${this.constructor.name}] onSocketClose "${this.entity.name}" error:`, (e.message || e))
		}
	}

	/**
	 * **Player**  Called when an error occurs in the WebSocket connection.
	 * @param {Error} error
	 */
	onSocketError(error) {
		console.log(`[${this.constructor.name}] onError "${this.entity.name}"`, error.message || error || '[no-code]');
		this.entity.emit('socket.error', error)
	}

	/**
	 * Sends a "ping" heartbeat packet over the WebSocket connection.
	 * The packet contains the current timestamp and is serialized to JSON format.
	 */
	onSocketHeartbeat() {
		this.socket.send(sendHeartbeat("ping", performance.now()))
		this.entity.emit('socket.heartbeat')
	}

	/**
	 * **Player** Broadcasts a message to all players in the world instance.
	 * @param {string|Buffer} data
	 * @param {boolean} isBinary
	 */
	broadcast(data, isBinary = false) {
		this.world.broadcast(data, isBinary)
		this.entity.emit('broadcast', data, isBinary)
	}

	/**
	 * Server update tick callback. Used to send updates to the client.
	 *
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	onTick(timestamp) {
		this.entity.emit('tick', timestamp)
		switch (this.entity.type) {
			case TYPE.PLAYER: onEntityUpdatePlayer(this.entity, timestamp); break;
			case TYPE.MONSTER: onEntityUpdateMonster(this.entity, timestamp); break;
			case TYPE.NPC: onEntityUpdateNPC(this.entity, timestamp); break;
			case TYPE.PORTAL: onEntityUpdatePortal(this.entity, timestamp); break;
			case TYPE.PET: onEntityUpdatePet(this.entity, timestamp); break;
			default: break;
		}
	}

	/**
	 * Called when the player entity enters a map.
	 * @param {import("../../../shared/models/WorldMap.js").WorldMap} newMap - The map the player is entering
	 * @param {import("../../../shared/models/WorldMap.js").WorldMap} oldMap - The map the player was previously in
	 */
	onEnterMap(newMap, oldMap) {
		this.entity.emit('map.enter', newMap, oldMap)
		return onEntityEnterMap(this.entity, newMap, oldMap)
	}

	/**
	 * Called when the player entity leaves a map.
	 * @param {import("../../../shared/models/WorldMap.js").WorldMap} newMap - The map the player is entering
	 * @param {import("../../../shared/models/WorldMap.js").WorldMap} oldMap - The map the player was previously in
	 */
	onLeaveMap(newMap, oldMap) {
		this.entity.emit('map.leave', newMap, oldMap)
		return onEntityLeaveMap(this.entity, newMap, oldMap)
	}

	/**
	 * Recalculates static player stats based on player level.
	 */
	syncStats() {
		// recalc static player stat by level
		const ent = this.entity
		const lv = ent.level

		ent.hpMax = lv * Const.PLAYER_BASE_HP
		ent.hpRecovery = lv * Const.PLAYER_BASE_HP_REGEN
		ent.mpMax = lv * Const.PLAYER_BASE_MP
		ent.mpRecovery = lv * Const.PLAYER_BASE_MP_REGEN

		ent.str = lv * Const.PLAYER_BASE_STR
		ent.agi = lv * Const.PLAYER_BASE_AGI
		ent.int = lv * Const.PLAYER_BASE_INT
		ent.vit = lv * Const.PLAYER_BASE_VIT
		ent.dex = lv * Const.PLAYER_BASE_DEX
		ent.luk = lv * Const.PLAYER_BASE_LUK

		// calc base Atk by level * 5 plus str
		ent.atk = (lv * Const.PLAYER_BASE_ATK) + ent.str
		ent.mAtk = (lv * Const.PLAYER_BASE_MATK) + ent.int

		// calc base Def by level * 1.5 plus vit
		ent.def = (lv * Const.PLAYER_BASE_DEF) + ent.vit
		// calc base MDef by level * 1.5 plus int + 25% of def
		ent.mDef = (lv * Const.PLAYER_BASE_MDEF) + ent.int + (ent.def * 0.25)

		this.entity.emit('sync.stats')
	}

	/**
	 * Finds entities in the range of the entity and starts auto-attacking them.
	 *
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	nearbyAutoAttack(timestamp) {
		try {
			const nearbyEntities = findMapEntitiesInRadius(this.map, this.entity.lastX, this.entity.lastY, this.entity.range)
				.filter(entity => entity.type === TYPE.MONSTER && entity.hp > 0)

			// no entities in radius
			if (nearbyEntities.length === 0) {
				this._attacking = null
				return
			}

			for (const entity of nearbyEntities) {
				// Monster interaction, player needs to be in range
				if (entity.type === TYPE.MONSTER) {
					// has target set and still in range?
					// then start combat
					if (this._attacking != null || this._follow != null) {
						this.attack(this._attacking || this._follow, timestamp)
						return
					}
				}
			}
		} catch (error) {
			console.error(`[${this.constructor.name}] nearbyAutoAttack (gid: ${this.entity.gid}) error:`, error.message || error || '[no-code]');
		}
	}

	/**
	 * Start attacking the target entity
	 * - call stopMoveTo method
	 *
	 * @param {import("../../../shared/models/Entity.js").Entity} entity - The target entity to attack.
	 * @param {number} timestamp - The current timestamp in milliseconds.
	 */
	attack(entity, timestamp) {
		if (entity.hp <= 0) return // must be alive
		if (entity.type === TYPE.NPC) return // NPC can't be attacked
		if (entity.type === TYPE.PORTAL) return // PORTAL can't be attacked
		if (this.map !== entity.control.map) return // must be in the same map
		if (this.entity.type === TYPE.PLAYER && entity.type === TYPE.PLAYER && !this.map.isPVP) return // PLAYER can attack in PVP map only

		this.stopMoveTo()

		this._attacking = entity // set target
		this._follow = entity // start to follow

		// entity last attacked time is set, and not ready to attack yet
		// aspd = attack speed. default 1000ms = 1 second
		// aspdMultiplier = attack speed multiplier. default 1.0
		if (this._attackAutoCd.isNotExpired(timestamp)) return // can't attack yet
		if (!inRangeOfEntity(this.entity, entity)) return // out of range
		// set auto-attack cooldown as timestamp + aspd * multiplier
		this._attackAutoCd.set(timestamp + (this.entity.aspd * this.entity.aspdMultiplier))
		this.entity.emit('attack.start', entity.gid)
		// entity take damage from attacker
		entity.control.takeDamageFrom(this.entity)
	}

	/**
	 * Stops the entity from attacking the target entity.
	 */
	stopAttack() {
		this._attacking = null
		this.entity.emit('attack.stop')
	}

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 * Reduces the entity's health points (hp) based on the attacker's
	 * strength, attack power, and attack multiplier. If the entity's hp
	 * falls to zero or below, the entity dies and is removed from the map.
	 *
	 * @param {import("../../../shared/models/Entity.js").Entity} attacker - The attacking entity
	 *        attributes such as strength (str), attack
	 *        power (atk), and attack multiplier (atkMultiplier).
	 * @param {number} extraMultiplyer - An extra multiplier for the damage for example skill use bonus
	 */
	takeDamageFrom(attacker, extraMultiplyer = 1.0) {
		if (this.entity.hp <= 0) return // must be alive
		if (this.entity.type === TYPE.NPC) return // NPC can't take damage
		if (this.entity.type === TYPE.PORTAL) return // PORTAL can't take damage
		if (this.map !== attacker.control.map) return // must be in the same map, to receive damage
		if (this.entity.type === TYPE.PLAYER && attacker.type === TYPE.PLAYER && !this.map.isPVP) return // PLAYER can take damage in PVP map only
		let lastHp = this.entity.hp
		// physical attacks are always neutral? what about weapons elements?
		// TODO take defence into account
		if (attacker.eAtk === ELEMENT.NEUTRAL) {
			this.entity.hp -= (attacker.str + attacker.atk) * attacker.atkMultiplier * extraMultiplyer;
		} else {
			this.entity.hp -= (attacker.int + attacker.mAtk) * attacker.mAtkMultiplier * extraMultiplyer;
		}
		this.entity.emit('damage', attacker.gid, this.entity.gid, lastHp, this.entity.hp)
		// if entity dies, call the onEntityKill event
		if (this.entity.hp <= 0) {
			this.entity.emit('die', attacker.gid, this.entity.gid)
			onEntityKill(attacker, this.entity)
		}
	}

	// /**
	//  * When entity dies, call the onEntityKill event.
	//  * @param {import("../models/Entity.js").Entity} attacker - The attacking entity
	//  */
	// die(attacker) {
	// 	onEntityKill(attacker, this.entity)
	// }

	/**
	 * Revives the entity by restoring their health points (hp) and
	 * mana points (mp) to their maximum values (hpMax and mpMax).
	 */
	revive() {
		this.entity.hp = Number(this.entity.hpMax)
		this.entity.mp = Number(this.entity.mpMax)
		this.entity.death = 0 // reset time of death
		this.entity.emit('revive', this.entity.gid)

		// send entity "revive" packet
		const world = this.entity.control.world
		const map = this.entity.control.map
		world.broadcastMap(map, sendMapEntity(this.entity, "hp", "mp", "death"))
	}

	/**
	 * Persist player core data and inventory to the database.
	 * Used for periodic saves and final logout save.
	 * @returns {Promise<object|null>} The result of `db.player.update` or null on error.
	 */
	async syncPlayerToDb() {
		if (this.entity.type !== TYPE.PLAYER) return null
		const player = this.entity
		try {
			// update player row
			const playerUpdate = await DB.player.sync(player)
			console.log(`[${this.constructor.name}] syncPlayerToDb (id:${player.id}) "${player.name}" ${playerUpdate && playerUpdate.id ? 'saved' : 'not saved'} to database.`)
			await DB.inventory.sync(player)
			player.emit('sync.saved', player.gid)
			return playerUpdate
		} catch (e) {
			console.log(`[${this.constructor.name}] syncPlayerToDb error:`, (e.message || e))
			return null
		}
	}

	/**
	 * Heals the entity's HP and/or MP by the specified amount.
	 * HP and MP will not exceed their maximum values (hpMax and mpMax).
	 * @param {number} [hp] - Amount of HP to heal.
	 * @param {number} [mp] - Amount of MP to heal.
	 * @example
	 * this.heal(10, 5); // heal 10 HP and 5 MP
	 * @example
	 * this.heal(this.entity.hpMax, this.entity.mpMax); // 100%
	 */
	heal(hp, mp) {
		let lastHp = this.entity.hp
		let lastMp = this.entity.mp
		if (hp) {
			this.entity.hp = Math.min(this.entity.hp + hp, this.entity.hpMax)
		}
		if (mp) {
			this.entity.mp = Math.min(this.entity.mp + mp, this.entity.mpMax)
		}
		this.entity.emit('heal', this.entity.gid, lastHp, this.entity.hp, lastMp, this.entity.mp)
	}

	/**
	 * Moves the entity to their saved map and position.
	 */
	toSavePosition() {
		// same map, just update position
		if (this.map.id === this.entity.saveMap) {
			this.lastX = this.entity.saveX
			this.lastY = this.entity.saveY
			this.entity.emit('savePosition', this.entity.gid)
			return
		}
		// different map, join
		if (this.entity.type === TYPE.PLAYER) {
			this.map.world.changeMap(this.entity, this.entity.saveMap, this.entity.saveX, this.entity.saveY).then(() => {
				this.entity.emit('savePosition', this.entity.gid)
			})
		}
	}

	/**
	 * Automatically regenerates the entity's HP and MP over time.
	 *
	 * The regeneration rate is based on the entity's HP and MP recovery rates.
	 * The cooldown for regeneration is set to the current timestamp + the
	 * recovery rate.
	 *
	 * @param {DOMHighResTimeStamp} timestamp - The current timestamp.
	 */
	autoRegenerate(timestamp) {
		// #region HP
		if (this._autoRegenerateHpCd.isExpired(timestamp)) {
			this._autoRegenerateHpCd.set(timestamp + this.entity.hpRecoveryRate)
			if (this.entity.hp < this.entity.hpMax) {
				this.entity.hp = Math.min(this.entity.hp + this.entity.hpRecovery, this.entity.hpMax)
			}
		}
		// #endregion

		// #region MP
		if (this._autoRegenerateMpCd.isExpired(timestamp)) {
			this._autoRegenerateMpCd.set(timestamp + this.entity.mpRecoveryRate)
			if (this.entity.mp < this.entity.mpMax) {
				this.entity.mp = Math.min(this.entity.mp + this.entity.mpRecovery, this.entity.mpMax)
			}
		}
		// #endregion
	}

	/**
	 * Moves the entity in the specified direction if possible.
	 * The movement is based on the entity's direction and current speed.
	 * Updates the entity's position on the map while ensuring it stays within boundaries.
	 * The movement is constrained by a delay calculated from speed / step.
	 *
	 * @param {number} dir - The direction to move the entity:
	 *   0: Left (x--), 1: Right (x++), 2: Up (y--), 3: Down (y++)
	 * @param {number} timestamp - The current timestamp or performance.now().
	 */
	move(dir, timestamp) {
		if (!this.entity.isMoveable) return // can't move
		if (this.entity.hp <= 0) return // must be alive

		// check if entity can move on this tick
		if (this._moveCd.isNotExpired(timestamp)) return
		this._moveCd.set(timestamp + (this.entity.speed * Const.ENTITY_MOVE_STEP) - this.entity.latency)

		switch (dir) {
			case DIR.LEFT:
				this.entity.dir = DIR.LEFT
				if (this.entity.lastX > 0) {
					this.entity.lastX -= Const.ENTITY_MOVE_STEP
					// this.moveTo(this.entity.lastX - Const.ENTITY_MOVE_STEP, this.entity.lastY, timestamp)
				}
				break
			case DIR.RIGHT:
				this.entity.dir = DIR.RIGHT
				if (this.entity.lastX < this.map.width) {
					this.entity.lastX += Const.ENTITY_MOVE_STEP
					// this.moveTo(this.entity.lastX + Const.ENTITY_MOVE_STEP, this.entity.lastY, timestamp)
				}
				break
			case DIR.UP:
				this.entity.dir = DIR.UP
				if (this.entity.lastY > 0) {
					this.entity.lastY -= Const.ENTITY_MOVE_STEP
					// this.moveTo(this.entity.lastX, this.entity.lastY - Const.ENTITY_MOVE_STEP, timestamp)

				}
				break
			case DIR.DOWN:
				this.entity.dir = DIR.DOWN
				if (this.entity.lastY < this.map.height) {
					this.entity.lastY += Const.ENTITY_MOVE_STEP
					// this.moveTo(this.entity.lastX, this.entity.lastY + Const.ENTITY_MOVE_STEP, timestamp)
				}
				break
			default:
				break
		}
		this.entity.emit('move', this.entity.gid, this.entity.dir)
	}

	/**
	 * Makes the entity follow another entity, by moving its position on each tick
	 * closer to the target entity. The target must be in the range.
	 * If the target moves out of range or dies, then stop following.
	 * @param {import("../../../shared/models/Entity.js").Entity} entity - The target entity to follow.
	 * @param {number} timestamp - The current timestamp or performance.now().
	 */
	follow(entity, timestamp) {
		this.stopMoveTo()
		if (!this.entity.isMoveable) return this.stopFollow() // can't move
		if (this.entity.hp <= 0) return this.stopFollow() // must be alive
		if (entity.hp <= 0) return this.stopFollow() // target must be alive
		if (inRangeOfEntity(this.entity, entity)) return this.stopFollow() // in range

		this._follow = entity

		// check if entity can move on this tick
		if (this._moveCd.isNotExpired(timestamp)) return
		this._moveCd.set(timestamp + (this.entity.speed * Const.ENTITY_MOVE_STEP) - this.entity.latency)

		// follow entity
		if (this.entity.lastX > entity.lastX) {
			this.entity.dir = DIR.LEFT
			this.entity.lastX -= Const.ENTITY_MOVE_STEP
		} else if (this.entity.lastX < entity.lastX) {
			this.entity.dir = DIR.RIGHT
			this.entity.lastX += Const.ENTITY_MOVE_STEP
		}
		if (this.entity.lastY > entity.lastY) {
			this.entity.dir = DIR.UP
			this.entity.lastY -= Const.ENTITY_MOVE_STEP
		} else if (this.entity.lastY < entity.lastY) {
			this.entity.dir = DIR.DOWN
			this.entity.lastY += Const.ENTITY_MOVE_STEP
		}

		// Note: test for frequent position updates
		// when entity is player, send position update
		// if (this.entity.type === ENTITY_TYPE.PLAYER) {
		// 	this.socket.send(sendPlayer(this.entity, "dir", "lastX", "lastY"))
		// }
		this.entity.emit('follow', this.entity.gid, entity.gid)
	}

	/**
	 * Stop following the currently followed entity.
	 */
	stopFollow() {
		this._follow = null
		this.entity.emit('follow.stop', this.entity.gid)
	}

	/**
	 * Start moving the entity closer to a specific position (x,y) on the map.
	 * The entity will continue to move closer to this set position on the next tick.
	 * If the entity is already at the target position, it will stop moving.
	 *
	 * @param {number} x - The x-coordinate of the target position
	 * @param {number} y - The y-coordinate of the target position
	 * @param {number} timestamp - The current timestamp in milliseconds
	 */
	moveTo(x, y, timestamp) {
		this.stopFollow()
		if (!this.entity.isMoveable) return this.stopMoveTo() // can't move
		if (this.entity.hp <= 0) return this.stopMoveTo() // must be alive
		// stop at range
		if (inRangeOf(this.entity, x, y, Const.ENTITY_MOVE_STEP)) {
			return this.stopMoveTo()
		}

		// set move to position
		// next tick will move entity closer to this position
		this._moveTo = { x, y }

		// check if entity can move on this tick
		if (this._moveCd.isNotExpired(timestamp)) return
		this._moveCd.set(timestamp + (this.entity.speed * Const.ENTITY_MOVE_STEP) - this.entity.latency)

		if (this.entity.lastX > x) {
			this.entity.dir = DIR.LEFT
			this.entity.lastX -= Const.ENTITY_MOVE_STEP
		} else if (this.entity.lastX < x) {
			this.entity.dir = DIR.RIGHT
			this.entity.lastX += Const.ENTITY_MOVE_STEP
		}
		if (this.entity.lastY > y) {
			this.entity.dir = DIR.UP
			this.entity.lastY -= Const.ENTITY_MOVE_STEP
		} else if (this.entity.lastY < y) {
			this.entity.dir = DIR.DOWN
			this.entity.lastY += Const.ENTITY_MOVE_STEP
		}

		// Note: test for frequent position updates
		// when entity is player, send position update
		// if (this.entity.type === ENTITY_TYPE.PLAYER) {
		// 	this.socket.send(sendPlayer(this.entity, "dir", "lastX", "lastY"))
		// }
		this.entity.emit('moveTo', this.entity.gid, x, y)
	}

	/**
	 * Stops the entity's movement towards a target position.
	 * Resets the target position, halting any ongoing movement.
	 */
	stopMoveTo() {
		this._moveTo = null
		this.entity.emit('moveTo.stop', this.entity.gid)
	}

	/**
	 * Calculates the direction of movement from the entity's current position to the target (x,y) coordinates.
	 * Returns one of the DIRECTION constants.
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	getMoveDir(x, y) {
		if (x > -1 && x < this.entity.lastX) return DIR.LEFT
		if (x > -1 && x > this.entity.lastX) return DIR.RIGHT
		if (y > -1 && y < this.entity.lastY) return DIR.UP
		if (y > -1 && y > this.entity.lastY) return DIR.DOWN
		return DIR.DOWN
	}

}
