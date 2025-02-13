import * as Packets from '../Packets.js';
import { AI } from './AI.js';
import { DIRECTION, ENTITY_TYPE } from '../enum/Entity.js';
import { ELEMENT } from '../enum/Element.js';
import { WorldMap } from '../models/WorldMap.js';
import { Entity } from '../models/Entity.js';
import {
	COOLDOWN_PORTAL_USE, COOLDOWN_SOCKET_SEND_MAP,
	COOLDOWN_SOCKET_SEND_PLAYER, ENTITY_AUTO_REVIVE_TIME,
	PLAYER_BASE_AGI, PLAYER_BASE_ATK,
	PLAYER_BASE_DEF, PLAYER_BASE_DEX, PLAYER_BASE_HP,
	PLAYER_BASE_HP_REGEN, PLAYER_BASE_INT, PLAYER_BASE_LUK,
	PLAYER_BASE_MATK, PLAYER_BASE_MDEF, PLAYER_BASE_MP,
	PLAYER_BASE_MP_REGEN, PLAYER_BASE_STR, PLAYER_BASE_VIT,
	SOCKET_MESSAGE_MAX_SIZE
} from '../Constants.js';
import { onEntityKill } from '../events/onEntityKill.js';
import { onEntityClickPosition } from '../events/onEntityClickPosition.js';
import { onEntityCloseDialog } from '../events/onEntityCloseDialog.js';
import { onEntityChat } from '../events/onEntityChat.js';
import { onEntityMove } from '../events/onEntityMove.js';
import Cooldown from '../utils/cooldown.js';

export class EntityControl {
	/**
	 * Creates a new EntityControl instance.
	 * @param {import("../models/Entity.js").Entity} entity - The entity to control.
	 * @param {import("../World.js").World} world - The world instance.
	 * @param {import("ws").WebSocket=} socket - The WebSocket instance.
	 * @param {import("../models/WorldMap.js").WorldMap=} map - The map instance.
	 */
	constructor(entity, world, socket, map) {
		this.entity = entity

		/** @type {import("../World.js").World} - World instance */
		this.world = world

		/** @type {import("ws").WebSocket} - Web Socket instance */
		this.socket = socket

		/** @type {import("../models/WorldMap.js").WorldMap} - WorldMap instance */
		this.map = map

		/** @type {import("./AI.js").AI|null=} - Monster AI. default null */
		this.ai = entity.type === ENTITY_TYPE.MONSTER ? new AI(entity) : null

		/** 
		 * @type {import("../models/Entity.js").Entity?} - attacking target entity 
		 */
		this._attacking = null
		/**
		 * @type {import("../models/Entity.js").Entity?} following this entity
		 */
		this._follow = null
		/** 
		 * @type {boolean=} whether the entity can move. default true 
		 */
		this._canMove = true
		/**
		 * @type {{x: number, y: number}|null} entity move to position
		 */
		this._moveTo = null

		// #region cooldowns
		this._attackAutoCd = new Cooldown()
		this._moveCd = new Cooldown()
		this._socketSentMapUpdateCd = new Cooldown()
		this._socketSentPlayerUpdateCd = new Cooldown()
		this._portalUseCd = new Cooldown()
		this._autoRegenerateHpCd = new Cooldown()
		this._autoRegenerateMpCd = new Cooldown()
		// #endregion

		// bind WebSocket functions for Players
		if (entity.type === ENTITY_TYPE.PLAYER) {
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
		try {
			// @ts-ignore limit the size of the message, player can send to us
			if ((data.length || data.byteLength) > SOCKET_MESSAGE_MAX_SIZE) {
				return console.log(`[${this.constructor.name}] "${this.entity.name}" sent too large message.`);
			}

			// parse JSON sent from the player
			const json = JSON.parse(data.toString());
			switch (json.type) {
				case 'move': onEntityMove(this.entity, json); break;
				case 'chat': onEntityChat(this.entity, json); break;
				case 'click': onEntityClickPosition(this.entity, json); break;
				case 'npc-dialog-close': onEntityCloseDialog(this.entity, json); break;
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
	onSocketClose() {
		console.log(`[${this.constructor.name}] onSocketClose "${this.entity.name}" connection closed.`);
		this.socket.off('close', this._onSocketClose)
		this.socket.off('error', this._onSocketError)
		this.socket.off('message', this._onSocketMessage)
		this.world.onClientClose(this.entity)
	}

	/**
	 * **Player**  Called when an error occurs in the WebSocket connection.
	 * @param {Error} error 
	 */
	onSocketError(error) {
		console.log(`[${this.constructor.name}] onError "${this.entity.name}"`, error.message || error || '[no-code]');
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
			case ENTITY_TYPE.PLAYER: this.onTickPlayer(timestamp); break;
			case ENTITY_TYPE.MONSTER: this.onTickMonster(timestamp); break;
			case ENTITY_TYPE.NPC: this.onTickNPC(timestamp); break;
			case ENTITY_TYPE.PORTAL: this.onTickPortal(timestamp); break;
			default: break;
		}
	}

	/**
	 * **Player** Server update tick callback. Used to send updates to the client.
	 * @param {number} timestamp 
	 */
	onTickPlayer(timestamp) {
		// update client map data,
		// so the client can update the map with new entity positions
		if (this._socketSentMapUpdateCd.isExpired(timestamp)) {
			this._socketSentMapUpdateCd.set(timestamp + COOLDOWN_SOCKET_SEND_MAP)
			this.socket.send(JSON.stringify(Packets.updateMap(this.map)));
		}

		// send full player state update every x seconds
		// send packet to client, containing player data
		if (this._socketSentPlayerUpdateCd.isExpired(timestamp)) {
			this._socketSentPlayerUpdateCd.set(timestamp + COOLDOWN_SOCKET_SEND_PLAYER)
			this.socket.send(JSON.stringify(Packets.updatePlayer(this.entity)));
		}

		// TODO implement other player updates, like stats that needs to be more frequent?
		// skills, equipment, inventory, quests for example, does not need to be updated so frequently.

		// check if player is alive, for the rest of the function
		if (this.entity.hp <= 0) return

		// automatic HP recovery
		// calculate how much hp to restore on each tick
		this.autoRegenerate(timestamp)

		// find entities in nearby for an auto-attack
		this.nearbyAutoAttack(timestamp)

		// continue following target if set
		if (this._follow != null) {
			this.follow(this._follow, timestamp)
		}

		// continue moving to set position if set
		if (this._moveTo != null) {
			this.moveTo(this._moveTo.x, this._moveTo.y, timestamp)
		}
	}

	/**
	 * **Monster** Server update tick callback. Used to do animations etc.
	 * @param {number} timestamp 
	 */
	onTickMonster(timestamp) {
		// check if entity is alive
		if (this.entity.hp <= 0) {
			// when entity has been dead for a x-minutes, revive it
			// and move it to the original position
			if (timestamp - this.entity.death > ENTITY_AUTO_REVIVE_TIME) {
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
			const nearbyEntities = WorldMap.findEntitiesInRadius(this.map, this.entity.lastX, this.entity.lastY, this.entity.range)
				.filter(entity => entity.gid !== this.entity.gid) // exclude the portal itself

			if (nearbyEntities.length === 0) return

			for (const entity of nearbyEntities) {
				// only players can be warped
				if (entity.type === ENTITY_TYPE.PLAYER) {
					// player use portal again 5 seconds after last portal used
					if (entity.control._portalUseCd.isExpired(timestamp)) {
						entity.control._portalUseCd.set(timestamp + COOLDOWN_PORTAL_USE)
						this.world.joinMapByName(entity, this.entity.portalName, this.entity.portalX, this.entity.portalY)
					}
				}
			}
		} catch (error) {
			console.error(`${this.constructor.name} ${this.entity.gid} error:`, error.message || error || '[no-code]');
		}
	}

	/**
	 * when player touches the Entity NPC send the dialog to the player in socket as message
	 * and make sure the player is nearby the NPC, when interacting with the NPC.
	 * Player can't move while interacting with the NPC
	 * 
	 * @param {import("../models/Entity.js").Entity} target 
	 * @param {number} timestamp `performance.now()` when the player starts interacting
	 */
	touch(target, timestamp) {
		if (!Entity.inRangeOfEntity(this.entity, target)) return

		console.log(`[${this.constructor.name}] "${this.entity.name}" started interacting with NPC "${target.name}" x:${target.lastX}, y:${target.lastY})`)
		this._canMove = false
		this.socket.send(JSON.stringify(Packets.updateNPCDialog(target.gid, target.dialog)))
	}

	/**
	 * Called when the player entity enters a map.
	 * @param {import("../models/WorldMap.js").WorldMap} map - The map the player is entering
	 * @param {import("../models/WorldMap.js").WorldMap} oldMap - The map the player was previously in
	 */
	async onEnterMap(map, oldMap) {
		console.log(`[${this.constructor.name}] id:${this.entity.id} "${this.entity.name}" enter map: "${map.name}" from "${oldMap?.name ?? ''}"`)
		// recalculate player stats
		this.syncStats()

		// Note: this is also send in onTick
		// send packet to client, containing player data
		this.socket.send(JSON.stringify(Packets.updatePlayer(this.entity)));
		return true
	}

	/**
	 * Called when the player entity leaves a map.
	 * @param {import("../models/WorldMap.js").WorldMap} map - The map the player is entering
	 * @param {import("../models/WorldMap.js").WorldMap} oldMap - The map the player was previously in
	 */
	async onLeaveMap(map, oldMap) {
		console.log(`[${this.constructor.name}] id:${this.entity.id} "${this.entity.name}" leave map: "${oldMap?.name ?? ''}" to "${map.name}"`)
		this.stopAttack()
		this.stopFollow()
		this.stopMoveTo()
		return true
	}

	/**
	 * Recalculates static player stats based on player level.
	 * 
	 * The following stats are recalculated:
	 * - hpMax
	 * - hpRecovery
	 * - mpMax
	 * - mpRecovery
	 * - atk
	 * - str
	 * - agi
	 * - int
	 * - vit
	 * - dex
	 * - luk
	 * - def
	 * - mDef
	 */
	syncStats() {
		// recalc static player stat by level
		const ent = this.entity
		const lv = ent.level

		ent.hpMax = lv * PLAYER_BASE_HP
		ent.hpRecovery = lv * PLAYER_BASE_HP_REGEN
		ent.mpMax = lv * PLAYER_BASE_MP
		ent.mpRecovery = lv * PLAYER_BASE_MP_REGEN

		ent.str = lv * PLAYER_BASE_STR
		ent.agi = lv * PLAYER_BASE_AGI
		ent.int = lv * PLAYER_BASE_INT
		ent.vit = lv * PLAYER_BASE_VIT
		ent.dex = lv * PLAYER_BASE_DEX
		ent.luk = lv * PLAYER_BASE_LUK

		// calc base Atk by level * 5 plus str
		ent.atk = (lv * PLAYER_BASE_ATK) + ent.str
		ent.mAtk = (lv * PLAYER_BASE_MATK) + ent.int

		// calc base Def by level * 1.5 plus vit
		ent.def = (lv * PLAYER_BASE_DEF) + ent.vit
		// calc base MDef by level * 1.5 plus int + 25% of def
		ent.mDef = (lv * PLAYER_BASE_MDEF) + ent.int + (ent.def * 0.25)
	}

	/**
	 * Finds entities in the range of the entity and starts auto-attacking them.
	 * 
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	nearbyAutoAttack(timestamp) {
		try {
			const nearbyEntities = WorldMap.findEntitiesInRadius(this.map, this.entity.lastX, this.entity.lastY, this.entity.range)
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
						return
					}
				}
			}
		} catch (error) {
			console.error(`[${this.constructor.name}] nearbyAutoAttack (gid: ${this.entity.gid}) error:`, error.message || error || '[no-code]');
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
		if (this._moveCd.isNotExpired(timestamp)) return
		this._moveCd.set(timestamp + (this.entity.speed * this.entity.speedMultiplier))

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
	 * Start moving the entity closer to a specific position (x,y) on the map.
	 * The entity will continue to move closer to this set position on the next tick.
	 * If the entity is already at the target position, it will stop moving.
	 * 
	 * @param {number} x - The x-coordinate of the target position
	 * @param {number} y - The y-coordinate of the target position
	 * @param {number} timestamp - The current timestamp in milliseconds
	 */
	moveTo(x, y, timestamp) {
		// already at target position
		if (x === this.entity.lastX && y === this.entity.lastY) {
			this._moveTo = null
			return
		}
		// already in range of target position
		if (Math.abs(x - this.entity.lastX) <= 4 && Math.abs(y - this.entity.lastY) <= 4) {
			this._moveTo = null
			return
		}
		const dir = this.getMoveDir(x, y)
		this.move(dir, timestamp)
		// set move to position
		// next tick will move entity closer to this position
		this._moveTo = { x, y }
	}

	/**
	 * Stops the entity's movement towards a target position.
	 * Resets the target position, halting any ongoing movement.
	 */
	stopMoveTo() {
		this._moveTo = null
	}

	/**
	 * Calculates the direction of movement from the entity's current position to the target (x,y) coordinates.
	 * Returns one of the DIRECTION constants.
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	getMoveDir(x, y) {
		if (x < this.entity.lastX) return DIRECTION.LEFT
		if (x > this.entity.lastX) return DIRECTION.RIGHT
		if (y < this.entity.lastY) return DIRECTION.UP
		if (y > this.entity.lastY) return DIRECTION.DOWN
	}

	/**
	 * Start attacking the target entity.
	 * 
	 * @param {import("../models/Entity.js").Entity} entity - The target entity to attack.
	 * @param {number} timestamp - The current timestamp in milliseconds.
	 */
	attack(entity, timestamp) {
		this.stopMoveTo()
		if (entity.type === ENTITY_TYPE.NPC) return // NPC can't be attacked
		if (entity.type === ENTITY_TYPE.PORTAL) return // PORTAL can't be attacked
		if (entity.hp <= 0) return // must be alive

		this._attacking = entity // set target
		this._follow = entity // start to follow

		// entity last attacked time is set, and not ready to attack yet
		// aspd = attack speed. default 1000ms = 1 second
		// aspdMultiplier = attack speed multiplier. default 1.0
		if (this._attackAutoCd.isNotExpired(timestamp)) {
			return // can't attack yet
		}
		if (!Entity.inRangeOfEntity(this.entity, entity)) {
			return // out of range
		}
		// set auto-attack cooldown as timestamp + aspd * multiplier
		this._attackAutoCd.set(timestamp + (this.entity.aspd * this.entity.aspdMultiplier))
		// entity take damage from attacker
		entity.control.takeDamageFrom(this.entity)
	}

	/**
	 * Stops the entity from attacking and following a target.
	 */
	stopAttack() {
		this._attacking = null
	}

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 * Reduces the entity's health points (hp) based on the attacker's
	 * strength, attack power, and attack multiplier. If the entity's hp
	 * falls to zero or below, the entity dies and is removed from the map.
	 * 
	 * @param {import("../models/Entity.js").Entity} attacker - The attacking entity
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

		// if entity dies, call the onEntityKill event
		if (this.entity.hp <= 0) {
			// this.die(attacker)
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
		if (hp) {
			this.entity.hp = Math.min(this.entity.hp + hp, this.entity.hpMax)
		}
		if (mp) {
			this.entity.mp = Math.min(this.entity.mp + mp, this.entity.mpMax)
		}
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
	 * Makes the entity follow another entity, by moving its position on each tick
	 * closer to the target entity. The target must be in the range.
	 * If the target moves out of range or dies, then stop following.
	 * @param {import("../models/Entity.js").Entity} entity - The target entity to follow.
	 * @param {number} timestamp - The current timestamp or performance.now().
	 */
	follow(entity, timestamp) {
		this.stopMoveTo()

		if (!this._canMove) return // can't move
		if (this.entity.hp <= 0) return // must be alive

		this._follow = entity

		// check if entity can move on this tick
		if (this._moveCd.isNotExpired(timestamp)) return
		this._moveCd.set(timestamp + (this.entity.speed * this.entity.speedMultiplier))

		// if target dies, stop following
		if (entity.hp <= 0) {
			this._follow = null
			return
		}

		// stop at range
		if (Entity.inRangeOfEntity(this.entity, entity)) {
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