import { DIRECTION, ENTITY_TYPE } from "./enum/Entity.js"
import { findMapEntitiesInRadius } from "./utils/EntityUtil.js"

/**
 * @module AI
 * @description AI class for handling AI logic for entities.
 */
export class AI {
	constructor(entity) {
		/** @type {import("./model/Entity.js").Entity} */
		this.entity = entity
		/** @type {number} - Timestamp in milliseconds when the monster last idled */
		this.iddleStart = 0
	}

	/**
	 * on each server tick / update do some AI stuff
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	onUpdate(timestamp) {
		// const deltaTime = timestamp - this.world.startTime // ms elapsed, since server started
		// console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)
		// const deltaTime = performance.now() - startTime // ms elapsed, since server started
		// when monster is idling, make it move a bit
		this.onIddleMovement(timestamp)

		// find entities in nearby
		// and set the target entity
		// then attack it
		this.detectNearby(20, timestamp)
	}

	/**
	 * Function to handle the movement of a monster entity on each tick.
	 * It checks if the entity can move, updates its position based on speed and direction,
	 * and ensures it stays within the map boundaries and doesn't move excessively from the original position.
	 * 
	 * make monster move in square pattern
	 * dir = 0 it will not move straight down (y++)
	 * dir = 1 it will not move straight right (x++)
	 * dir = 2 it will not move straight up (y--)
	 * dir = 3 it will not move straight left (x--)
	 * it can't move out of the map max width/height
	 * it can't mode more than 10 times from the original saveX/saveY positions
	 */
	onIddleMovement(timestamp) {
		const entity = this.entity

		// check if entity can move
		// check if entity is still alive and in a map
		// check if iddleStart is greater than 5000ms
		if (entity.hp > 0 && entity.control.map != null) {
			// check if monster is in combat, then do not iddle
			if (entity.control._attacking != null) {
				return
			}
			// make the monster stay put for 5 seconds,
			// every 5 seconds it will move again
			if (this.iddleStart === 0) {
				this.iddleStart = timestamp
				return
			}
			if ((timestamp - this.iddleStart) < 5000) {
				return
			}

			// check movement delay
			if (!this.iddleMoveStartTime(timestamp)) {
				return
			}

			if (entity.dir === DIRECTION.DOWN) {
				if ((entity.lastY < entity.saveY + 10) && entity.lastY < entity.control.map.height) {
					entity.lastY++
				} else {
					entity.dir = DIRECTION.RIGHT
					this.iddleStart = timestamp
				}
			}
			if (entity.dir === DIRECTION.RIGHT) {
				if ((entity.lastX < entity.saveX + 10) && entity.lastX < entity.control.map.width) {
					entity.lastX++
				} else {
					entity.dir = DIRECTION.UP
					this.iddleStart = timestamp
				}
			}
			if (entity.dir === DIRECTION.UP) {
				if ((entity.lastY > entity.saveY - 10) && entity.lastY > 0) {
					entity.lastY--
				} else {
					entity.dir = DIRECTION.LEFT
					this.iddleStart = timestamp
				}
			}
			if (entity.dir === DIRECTION.LEFT) {
				if ((entity.lastX > entity.saveX - 10) && entity.lastX > 0) {
					entity.lastX--
				} else {
					entity.dir = DIRECTION.DOWN
					this.iddleStart = timestamp
				}
			}
		}
	}

	/**
	 * Function to control the movement start time of the entity.
	 * It checks if the entity's movement timer has reached a certain delay specified in milliseconds.
	 * Entity speed and speedMultiplier are used to calculate the delay.
	 * 
	 * @returns {boolean} Returns true if the entity's move delay has not exceeded the specified time, otherwise false.
	 */
	iddleMoveStartTime(timestamp) {
		if (this.entity.control._moveCd !== 0 && timestamp - this.entity.control._moveCd < this.entity.speed) {
			return false
		}
		this.entity.control._moveCd = timestamp
		return true
	}

	/**
	 * Finds entities in the given radius around the entity.
	 * @param {number} radius - The radius to search for entities.
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	detectNearby(radius, timestamp) {
		try {
			const self = this.entity

			// find entities in x tiles radius
			const nearbyEntities = findMapEntitiesInRadius(self.control.map, self.lastX, self.lastY, radius)
				.filter(entity => entity.gid !== self.gid) // exclude self

			// no entities in radius
			if (nearbyEntities.length === 0) {
				self.control._attacking = null
				return
			}

			// find Player type entity and set it as target
			// then attack it
			for (const entity of nearbyEntities) {
				if (entity.type === ENTITY_TYPE.PLAYER) {
					// start following target
					self.control.follow(entity, timestamp)
					// has previous target and still in range
					// then attack it
					if (self.control._attacking != null) {
						self.control.attack(self.control._attacking, timestamp)
					} else {
						self.control._attacking = entity
						self.control.attack(entity, timestamp)
					}
				}
			}
		} catch (error) {
			console.error(`${this.constructor.name} ${this.entity.gid} error:`, error.message || error || '[no-code]');
		}
	}
}