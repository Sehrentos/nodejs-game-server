import { ENTITY_AI_IDDLE_MOVE_MAX, ENTITY_AI_IDDLE_TIME } from "../../../shared/Constants.js"
import { DIR, TYPE } from "../../../shared/enum/Entity.js"
import { findMapEntitiesInRadius } from "../../../shared/utils/EntityUtils.js"
import { removeEntityFromMaps } from "../actions/removeEntityFromMaps.js"

/**
 * @module AIPet
 * @description AI class for handling AI logic for entities.
 */
export class AIPet {
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
		if (this.entity.owner == null) {
			console.log("[DEBUG] Removing Pet, owner is null")
			removeEntityFromMaps(this.entity)
			return
		}
		this.entity.control.follow(this.entity.owner, timestamp)
		// this.detectNearby(ENTITY_AI_NEARBY_RANGE, timestamp)
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
		const ctrl = entity.control

		// check if entity can move
		// check if entity is still alive and in a map
		// check if iddleStart is greater than 5000ms
		if (entity.hp > 0 && ctrl.map != null) {
			// check if is in combat, then do not iddle
			if (ctrl._attacking != null) {
				return
			}
			// stay put for 5 seconds,
			// after it will move again
			if (this.iddleStart === 0) {
				this.iddleStart = timestamp
				return
			}
			if ((timestamp - this.iddleStart) < ENTITY_AI_IDDLE_TIME) {
				return
			}

			if (entity.dir === DIR.DOWN) {
				if ((entity.lastY < entity.saveY + ENTITY_AI_IDDLE_MOVE_MAX) && entity.lastY < ctrl.map.height) {
					ctrl.move(DIR.DOWN, timestamp)
				} else {
					// next direction
					entity.dir = DIR.RIGHT
					this.iddleStart = timestamp
				}
			}
			if (entity.dir === DIR.RIGHT) {
				if ((entity.lastX < entity.saveX + ENTITY_AI_IDDLE_MOVE_MAX) && entity.lastX < ctrl.map.width) {
					ctrl.move(DIR.RIGHT, timestamp)
				} else {
					entity.dir = DIR.UP
					this.iddleStart = timestamp
				}
			}
			if (entity.dir === DIR.UP) {
				if ((entity.lastY > entity.saveY - ENTITY_AI_IDDLE_MOVE_MAX) && entity.lastY > 0) {
					ctrl.move(DIR.UP, timestamp)
				} else {
					entity.dir = DIR.LEFT
					this.iddleStart = timestamp
				}
			}
			if (entity.dir === DIR.LEFT) {
				if ((entity.lastX > entity.saveX - ENTITY_AI_IDDLE_MOVE_MAX) && entity.lastX > 0) {
					ctrl.move(DIR.LEFT, timestamp)
				} else {
					entity.dir = DIR.DOWN
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
			const ctrl = self.control

			// find entities in x tiles radius
			const nearbyEntities = findMapEntitiesInRadius(ctrl.map, self.lastX, self.lastY, radius)
				.filter(entity => entity.gid !== self.gid && entity.gid !== self.owner.gid) // exclude self and owner

			// no entities in radius
			if (nearbyEntities.length === 0) {
				ctrl._attacking = null
				return
			}

			// find entity and set it as target
			for (const entity of nearbyEntities) {
				if (entity.type === TYPE.MONSTER) {
					// when player used portal, await it's cooldown to end before attack
					if (entity.control._portalUseCd.isNotExpired(timestamp)) {
						continue; // skip to next target
					}
					// start following target
					ctrl.follow(entity, timestamp)
					// has previous target and still in range
					// then attack it
					if (ctrl._attacking != null) {
						ctrl.attack(ctrl._attacking, timestamp)
					} else {
						ctrl._attacking = entity
						ctrl.attack(entity, timestamp)
					}
					return
				}
			}
		} catch (error) {
			console.error(`${this.constructor.name} ${this.entity.gid} error:`, error.message || error || '[no-code]');
		}
	}
}
