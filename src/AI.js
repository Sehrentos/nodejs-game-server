import { ENTITY_TYPE } from "./enum/Entity.js"

// TODO make entity follow a target, when in combat
export class AI {
	constructor(entity) {
		/** @type {import("./control/MonsterControl.js").MonsterControl} */
		this.entity = entity
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
		this.detectNearByEntities(10, timestamp)
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
		if (entity.hp > 0 && entity.map != null) {
			// check if monster is in combat, then do not iddle
			if (entity.attacking != null) {
				return
			}
			// make the monster stay put for 5 seconds,
			// every 5 seconds it will move again
			if (entity.iddleStart === 0) {
				entity.iddleStart = timestamp
				return
			}
			if ((timestamp - entity.iddleStart) < 5000) {
				return
			}

			// check movement delay
			if (!this.iddleMoveStartTime(timestamp)) {
				return
			}

			if (entity.dir === 0) {
				if ((entity.y < entity.saveY + 10) && entity.y < entity.map.height) {
					entity.y++
				} else {
					entity.dir = 1//Math.floor(Math.random() * 3) + 1//Math.floor(Math.random() * 4)
					entity.iddleStart = timestamp
				}
			}
			if (entity.dir === 1) {
				if ((entity.x < entity.saveX + 10) && entity.x < entity.map.width) {
					entity.x++
				} else {
					entity.dir = 2//Math.floor(Math.random() * 4)
					entity.iddleStart = timestamp
				}
			}
			if (entity.dir === 2) {
				if ((entity.y > entity.saveY - 10) && entity.y > 0) {
					entity.y--
				} else {
					entity.dir = 3//Math.floor(Math.random() * 4)
					entity.iddleStart = timestamp
				}
			}
			if (entity.dir === 3) {
				if ((entity.x > entity.saveX - 10) && entity.x > 0) {
					entity.x--
				} else {
					entity.dir = 0
					entity.iddleStart = timestamp
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
		if (this.entity.movementStart !== 0 && timestamp - this.entity.movementStart < this.entity.speed * this.entity.speedMultiplier) {
			return false
		}
		this.entity.movementStart = timestamp
		return true
	}

	/**
	 * Finds entities in the given radius around the entity.
	 * @param {number} radius - The radius to search for entities.
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	detectNearByEntities(radius, timestamp) {
		try {
			const self = this.entity

			// find entities in x tiles radius
			const nearbyEntities = self.map.findEntitiesInRadius(self.x, self.y, radius)
				.filter(entity => entity.gid !== self.gid) // exclude self

			// no entities in radius
			if (nearbyEntities.length === 0) {
				self.attacking = null
				return
			}

			// find Player type entity and set it as target
			// then attack it
			for (const entity of nearbyEntities) {
				if (entity.type === ENTITY_TYPE.PLAYER) {
					// has previous target and still in range
					// then attack it
					if (self.attacking != null) {
						self.attack(self.attacking, timestamp)
					} else {
						self.attacking = entity
						self.attack(entity, timestamp)
					}
				}
			}
		} catch (error) {
			console.error(`${this.constructor.name} ${this.entity.gid} error:`, error.message || error || '[no-code]');
		}
	}
}