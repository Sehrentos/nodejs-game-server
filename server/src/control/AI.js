import { ENTITY_AI_NEARBY_RANGE, ENTITY_AI_IDDLE_MOVE_MAX, ENTITY_AI_IDDLE_TIME } from "../../../shared/Constants.js"
import { DIRECTION, ENTITY_TYPE } from "../../../shared/enum/Entity.js"
import { WorldMap } from "../../../shared/models/WorldMap.js"

/**
 * @module AI
 * @description AI class for handling AI logic for entities.
 */
export class AI {
	constructor(entity) {
		/** @type {import("../../../shared/models/Entity.js").Entity} */
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
		this.detectNearby(ENTITY_AI_NEARBY_RANGE, timestamp)
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
	 * it can't mode more than ENTITY_IDDLE_MOVE_MAX from the original saveX/saveY positions
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
			// after it will move again
			if (this.iddleStart === 0) {
				this.iddleStart = timestamp
				return
			}
			if ((timestamp - this.iddleStart) < ENTITY_AI_IDDLE_TIME) {
				return
			}

			// check movement delay
			if (this.entity.control._moveCd.isNotExpired(timestamp)) return

			if (entity.dir === DIRECTION.DOWN) {
				if ((entity.lastY < entity.saveY + ENTITY_AI_IDDLE_MOVE_MAX) && entity.lastY < entity.control.map.height) {
					entity.control.move(DIRECTION.DOWN, timestamp)
				} else {
					// next direction
					entity.dir = DIRECTION.RIGHT
					this.iddleStart = timestamp
				}
			}
			if (entity.dir === DIRECTION.RIGHT) {
				if ((entity.lastX < entity.saveX + ENTITY_AI_IDDLE_MOVE_MAX) && entity.lastX < entity.control.map.width) {
					entity.control.move(DIRECTION.RIGHT, timestamp)
				} else {
					entity.dir = DIRECTION.UP
					this.iddleStart = timestamp
				}
			}
			if (entity.dir === DIRECTION.UP) {
				if ((entity.lastY > entity.saveY - ENTITY_AI_IDDLE_MOVE_MAX) && entity.lastY > 0) {
					entity.control.move(DIRECTION.UP, timestamp)
				} else {
					entity.dir = DIRECTION.LEFT
					this.iddleStart = timestamp
				}
			}
			if (entity.dir === DIRECTION.LEFT) {
				if ((entity.lastX > entity.saveX - ENTITY_AI_IDDLE_MOVE_MAX) && entity.lastX > 0) {
					entity.control.move(DIRECTION.LEFT, timestamp)
				} else {
					entity.dir = DIRECTION.DOWN
					this.iddleStart = timestamp
				}
			}
		}
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
			const nearbyEntities = WorldMap.findEntitiesInRadius(self.control.map, self.lastX, self.lastY, radius)
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
					// when player used portal, await it's cooldown to end before attack
					if (entity.control._portalUseCd.isNotExpired(timestamp)) {
						continue; // skip to next target
					}
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
					return
				}
			}
		} catch (error) {
			console.error(`${this.constructor.name} ${this.entity.gid} error:`, error.message || error || '[no-code]');
		}
	}
}
