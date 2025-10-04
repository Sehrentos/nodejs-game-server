import * as Const from "../../../shared/Constants.js"
import { DIR, TYPE } from "../../../shared/enum/Entity.js"
import { inRangeOf, inRangeOfEntity, findMapEntitiesInRadius } from "../../../shared/utils/EntityUtils.js"
import Cooldown from "../../../shared/utils/Cooldown.js"

/**
 * Player controller used for client-side predictions
 */
export default class PlayerControl {
	/**
	 * @param {import("../State.js").State} state
	 */
	constructor(state) {
		/** @type {import("../State.js").State} */
		this.state = state

		/** @type {import("../../../shared/models/Entity.js").Entity?} - attacking target entity */
		this._attacking = null

		/** @type {import("../../../shared/models/Entity.js").Entity?} following this entity */
		this._follow = null

		/** @type {{x: number, y: number}|null} entity move to position */
		this._moveTo = null

		// #region cooldowns
		this._moveCd = new Cooldown()
		this._attackAutoCd = new Cooldown()
		// #endregion
	}

	/**
	 * The player entity (from state)
	 * @returns {import("../../../shared/models/Entity.js").Entity|null}
	 */
	get entity() {
		return this.state.player.value
	}

	/**
	 * The world map (from state)
	 * @returns {import("../../../shared/models/WorldMap.js").WorldMap|null}
	 */
	get map() {
		return this.state.map.value
	}

	/**
	 * The main game loop (from Renderer)
	 * @param {DOMHighResTimeStamp} timestamp - The current timestamp in milliseconds
	 * @returns
	 */
	onTick(timestamp) {
		if (this._follow != null) {
			this.follow(this._follow, timestamp)
		}
		if (this._moveTo != null) {
			this.moveTo(this._moveTo.x, this._moveTo.y, timestamp)
		}
	}

	/**
	 * an action when the player touches a position (from TouchControl)
	 * @param {number} x
	 * @param {number} y
	 */
	touchPosition(x, y) {
		const timestamp = Date.now()
		const player = this.entity
		const map = this.map

		if (map == null || player == null) return
		if (player.hp <= 0) return

		// find entities at clicked position in x radius
		const entities = findMapEntitiesInRadius(map, x, y, Const.PLAYER_TOUCH_AREA_SIZE)
			.filter(entity => entity.gid !== player.gid) // exclude self

		// if no entities found
		// start moving to the clicked position
		if (entities.length === 0) {
			this.moveTo(x, y, timestamp)
			return
		}

		// 1. priority - Monster (alive)
		const mobs = entities.filter(e => e.type === TYPE.MONSTER && e.hp > 0)
		if (mobs.length) {
			return this.touch(player, mobs[0], timestamp)
		}

		// 2. priority - NPC
		const npcs = entities.filter(e => e.type === TYPE.NPC)
		if (npcs.length) {
			return this.touch(player, npcs[0], timestamp)
		}

		// 3. priority - Player
		const players = entities.filter(e => e.type === TYPE.PLAYER)
		if (players.length) {
			return this.touch(player, players[0], timestamp)
		}

		// 4. priority - PORTAL
		const portals = entities.filter(e => e.type === TYPE.PORTAL)
		if (portals.length) {
			return this.touch(player, portals[0], timestamp)
		}

		// 5. move to position
		this.moveTo(x, y, timestamp)
	}

	/**
	 * Handles the interaction between a player and another entity when the player touches/clicks
	 * on the map. Depending on the type of entity, the player may attack, follow, or interact
	 * with the entity. The interaction logic varies:
	 * - If the entity is a MONSTER, the player will attack it.
	 * - If the entity is a PLAYER and the map is PVP-enabled, the player will attack the other player.
	 * - If the entity is an NPC, the player will follow the NPC if not in range, or interact if in range.
	 * - If the entity is a PORTAL, the player will move to the portal's position.
	 *
	 * @param {import("../../../shared/models/Entity.js").Entity} player - The player entity initiating the interaction.
	 * @param {import("../../../shared/models/Entity.js").Entity} entity - The target entity being interacted with.
	 * @param {number} timestamp - The current timestamp or performance.now().
	 */
	touch(player, entity, timestamp) {
		// const ctrl = player.control
		const inRange = inRangeOfEntity(player, entity)

		switch (entity.type) {
			case TYPE.MONSTER:
				this.attack(entity, timestamp)
				break;

			case TYPE.PLAYER:
				// player interaction
				if (this.map.isPVP) {
					this.attack(entity, timestamp)
				}
				break;

			case TYPE.NPC:
				// must be in range to interact with
				if (!inRange) {
					// start moving towards the NPC
					this.follow(entity, timestamp)
					return
				}
				// in range of the NPC
				// while interacting with an NPC disable entity movement
				// entity.isMoveable = false
				// send start NPC interact message
				// this is done in the server side
				// this.socket.send(sendDialog(entity.gid, entity.dialog))
				break;

			case TYPE.PORTAL:
				this.moveTo(entity.lastX, entity.lastY, timestamp)
				break;

			default:
				break;
		}
	}

	/**
	 * Client side prediction for movement with keyboard.
	 * @param {string} keyCode - The key code from the keyboard event.
	 * @param {number} timestamp - The current timestamp in milliseconds.
	 * @returns {boolean} True if the entity was moved successfully, false otherwise.
	 */
	keyboardMove(keyCode, timestamp) {
		const entity = this.state.player.value
		if (entity == null) return false

		// client side prediction for movement with keyboard
		switch (keyCode) {
			case "KeyA":
			case "ArrowLeft":
				this.move(DIR.LEFT, timestamp)
				break
			case "KeyD":
			case "ArrowRight":
				this.move(DIR.RIGHT, timestamp)
				break
			case "KeyW":
			case "ArrowUp":
				this.move(DIR.UP, timestamp)
				break
			case "KeyS":
			case "ArrowDown":
				this.move(DIR.DOWN, timestamp)
				break
			default:
				break
		}
		return true
	}

	/**
	 * Moves the entity in the specified direction if possible.
	 *
	 * @param {number} dir - The direction to move the entity:
	 *   0: Left (x--), 1: Right (x++), 2: Up (y--), 3: Down (y++)
	 * @param {number} timestamp - The current timestamp or performance.now().
	 */
	move(dir, timestamp) {
		const entity = this.entity
		if (!entity.isMoveable) return // can't move
		if (entity.hp <= 0) return // must be alive

		if (this._moveCd.isNotEqual(0) && this._moveCd.isNotExpired(timestamp)) return
		// this._moveCd.set(timestamp + entity.speed)
		this._moveCd.set(timestamp + (entity.speed * Const.ENTITY_MOVE_STEP) - entity.latency)

		switch (dir) {
			case DIR.LEFT:
				entity.dir = dir
				if (entity.lastX > 0) {
					entity.lastX -= Const.ENTITY_MOVE_STEP
					// this.moveTo(entity.lastX - Const.ENTITY_MOVE_STEP, entity.lastY, timestamp)
				}
				break
			case DIR.RIGHT:
				entity.dir = dir
				if (entity.lastX < this.map.width) {
					entity.lastX += Const.ENTITY_MOVE_STEP
					// this.moveTo(entity.lastX + Const.ENTITY_MOVE_STEP, entity.lastY, timestamp)
				}
				break
			case DIR.UP:
				entity.dir = dir
				if (entity.lastY > 0) {
					entity.lastY -= Const.ENTITY_MOVE_STEP
					// this.moveTo(entity.lastX, entity.lastY - Const.ENTITY_MOVE_STEP, timestamp)
				}
				break
			case DIR.DOWN:
				entity.dir = dir
				if (entity.lastY < this.map.height) {
					entity.lastY += Const.ENTITY_MOVE_STEP
					// this.moveTo(entity.lastX, entity.lastY + Const.ENTITY_MOVE_STEP, timestamp)
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
		const entity = this.entity
		this.stopFollow()
		if (entity == null) return this.stopMoveTo()
		if (!entity.isMoveable) return this.stopMoveTo() // can't move
		if (entity.hp <= 0) return this.stopMoveTo() // must be alive
		if (inRangeOf(entity, x, y, Const.ENTITY_MOVE_STEP)) return this.stopMoveTo() // in range

		// set move to position
		// next tick will move entity closer to this position
		this._moveTo = { x, y }

		// check if entity can move on this tick
		// if (!this._moveCd.isExpired(timestamp)) return
		// if (this._moveCd.isNotEqual(0) && this._moveCd.isNotExpired(timestamp)) return
		// this._moveCd.set(timestamp + (entity.speed * Const.ENTITY_MOVE_STEP) - entity.latency)

		if (entity.lastX > x) {
			entity.dir = DIR.LEFT
			entity.lastX -= Const.ENTITY_MOVE_STEP
		} else if (entity.lastX < x) {
			entity.dir = DIR.RIGHT
			entity.lastX += Const.ENTITY_MOVE_STEP
		}
		if (entity.lastY > y) {
			entity.dir = DIR.UP
			entity.lastY -= Const.ENTITY_MOVE_STEP
		} else if (entity.lastY < y) {
			entity.dir = DIR.DOWN
			entity.lastY += Const.ENTITY_MOVE_STEP
		}

		// if (entity.lastX > x && entity.lastX > 0) {
		// 	entity.dir = DIRECTION.LEFT
		// 	entity.lastX -= Const.ENTITY_MOVE_STEP
		// } else if (entity.lastX < x && entity.lastX < this.map.width) {
		// 	entity.dir = DIRECTION.RIGHT
		// 	entity.lastX += Const.ENTITY_MOVE_STEP
		// }
		// if (entity.lastY > y && entity.lastY > 0) {
		// 	entity.dir = DIRECTION.UP
		// 	entity.lastY -= Const.ENTITY_MOVE_STEP
		// } else if (entity.lastY < y && entity.lastY < this.map.height) {
		// 	entity.dir = DIRECTION.DOWN
		// 	entity.lastY += Const.ENTITY_MOVE_STEP
		// }
	}

	/**
	 * Makes the entity follow another entity, by moving its position on each tick
	 * closer to the target entity. The target must be in the range.
	 * If the target moves out of range or dies, then stop following.
	 * @param {import("../../../shared/models/Entity.js").Entity} entity - The target entity to follow.
	 * @param {number} timestamp - The current timestamp or performance.now().
	 */
	follow(entity, timestamp) {
		const player = this.entity
		this.stopMoveTo()
		if (entity == null) return this.stopFollow()
		if (!player.isMoveable) return this.stopFollow() // can't move
		if (player.hp <= 0) return this.stopFollow() // must be alive
		if (entity.hp <= 0) return this.stopFollow() // target must be alive
		if (inRangeOfEntity(player, entity)) return this.stopFollow() // in range

		this._follow = entity

		// check if entity can move on this tick
		// if (!this._moveCd.isExpired(timestamp)) return
		if (this._moveCd.isNotExpired(timestamp)) return
		// // this._moveCd.set((timestamp + player.speed)
		this._moveCd.set(timestamp + (player.speed * Const.ENTITY_MOVE_STEP) - entity.latency)

		// follow entity
		if (player.lastX > entity.lastX) {
			player.dir = DIR.LEFT
			player.lastX -= Const.ENTITY_MOVE_STEP
		} else if (player.lastX < entity.lastX) {
			player.dir = DIR.RIGHT
			player.lastX += Const.ENTITY_MOVE_STEP
		}
		if (player.lastY > entity.lastY) {
			player.dir = DIR.UP
			player.lastY -= Const.ENTITY_MOVE_STEP
		} else if (player.lastY < entity.lastY) {
			player.dir = DIR.DOWN
			player.lastY += Const.ENTITY_MOVE_STEP
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
		const player = this.entity
		const map = this.map

		if (player == null) return
		if (entity.hp <= 0) return // must be alive
		if (entity.type === TYPE.NPC) return // NPC can't be attacked
		if (entity.type === TYPE.PORTAL) return // PORTAL can't be attacked
		if (player.type === TYPE.PLAYER && entity.type === TYPE.PLAYER && !map.isPVP) return // PLAYER can attack in PVP map only

		this.stopMoveTo()

		this._attacking = entity // set target
		this._follow = entity // start to follow

		// entity last attacked time is set, and not ready to attack yet
		// aspd = attack speed. default 1000ms = 1 second
		// aspdMultiplier = attack speed multiplier. default 1.0
		if (!this._attackAutoCd.isExpired(timestamp)) return // can't attack yet
		if (!inRangeOfEntity(player, entity)) return // out of range
		// set auto-attack cooldown as timestamp + aspd * multiplier
		this._attackAutoCd.set(timestamp + (player.aspd * player.aspdMultiplier))
		// entity take damage from attacker
		this.takeDamageFrom(player, entity)
	}

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 *
	 * @param {import("../../../shared/models/Entity.js").Entity} attacker - The attacking entity
	 * @param {import("../../../shared/models/Entity.js").Entity} attacked - The attacked entity
	 */
	takeDamageFrom(attacker, attacked) {
		// predict the damage that the attacker will do to the entity
		// implementation is in server side EntityControl
		if (attacked.hp <= 0) this.stopAttack()
	}

	/**
	 * Stops the entity from attacking the target entity.
	 */
	stopAttack() {
		this._attacking = null
	}

	/**
	 * Stop following the currently followed entity.
	 */
	stopFollow() {
		this._follow = null
	}

	/**
	 * Stops the entity's movement towards a target position.
	 * Resets the target position, halting any ongoing movement.
	 */
	stopMoveTo() {
		this._moveTo = null
	}

	// /**
	//  * Calculates the direction of movement from the entity's current position to the target (x,y) coordinates.
	//  * Returns one of the DIRECTION constants.
	//  * @param {number} x
	//  * @param {number} y
	//  * @returns {number}
	//  */
	// getMoveDir(x, y) {
	// 	const entity = this.entity
	// 	if (x > -1 && x < entity.lastX) return DIRECTION.LEFT
	// 	if (x > -1 && x > entity.lastX) return DIRECTION.RIGHT
	// 	if (y > -1 && y < entity.lastY) return DIRECTION.UP
	// 	if (y > -1 && y > entity.lastY) return DIRECTION.DOWN
	// 	return DIRECTION.DOWN
	// }
}
