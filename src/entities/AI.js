import { Entity } from "./Entity.js"

export class AI {
	constructor(entity) {
		this.entity = entity
	}

	/**
	 * on each server tick / update do some AI stuff
	 * @param {*} startTime 
	 * @param {*} updateTime 
	 */
	onUpdate(startTime, updateTime) {
		// const deltaTime = performance.now() - startTime // ms elapsed, since server started
		// const deltaUpdateTime = performance.now() - updateTime // ms elapsed, since last server update

		// monster AI
		if (this.entity.type === Entity.TYPE.MONSTER) {
			// when monster is idling, make it move a bit
			this.onIddleMovement(startTime, updateTime)
		}
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
	 * it can't mode more than 10 times from the original _y/_x positions
	 * @returns 
	 */
	onIddleMovement(startTime, updateTime) {
		const entity = this.entity
		const now = performance.now()

		// check if entity can move
		// check if entity is still alive and in a map
		// check if iddleStart is greater than 5000ms
		if (entity.hp > 0 && entity.map != null) {
			// this will make the entity stay put for 5 seconds
			// if (!this.iddleStartTime(5000)) {
			//     return
			// }

			// check movement delay
			if (!this.iddleMoveStartTime()) {
				return
			}

			if (entity.dir === 0) {
				if ((entity.y < entity._y + 10) && entity.y < entity.map.height) {
					entity.y++
				} else {
					entity.dir = 1//Math.floor(Math.random() * 3) + 1//Math.floor(Math.random() * 4)
				}
			}
			if (entity.dir === 1) {
				if ((entity.x < entity._x + 10) && entity.x < entity.map.width) {
					entity.x++
				} else {
					entity.dir = 2//Math.floor(Math.random() * 4)
				}
			}
			if (entity.dir === 2) {
				if ((entity.y > entity._y - 10) && entity.y > 0) {
					entity.y--
				} else {
					entity.dir = 3//Math.floor(Math.random() * 4)
				}
			}
			if (entity.dir === 3) {
				if ((entity.x > entity._x - 10) && entity.x > 0) {
					entity.x--
				} else {
					entity.dir = 0
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
	iddleMoveStartTime() {
		if (this.entity.movementStart !== 0 && performance.now() - this.entity.movementStart < this.entity.speed * this.entity.speedMultiplier) {
			return false
		}
		this.entity.movementStart = performance.now()
		return true
	}

	/**
	 * Function to control the idleness start time of the entity.
	 * It checks if the entity's idleness has reached a certain duration specified in milliseconds.
	 * 
	 * @param {number} [timeInMs=5000] - The duration in milliseconds to check for idleness.
	 * @returns {boolean} Returns true if the entity's idleness duration has exceeded the specified time, otherwise false.
	 */
	iddleStartTime(timeInMs = 5000) { // FIXME
		if (this.entity.iddleStart === 0) {
			this.entity.iddleStart = performance.now()
			return false
		} else if (performance.now() - this.entity.iddleStart < timeInMs) {
			return false
		}
		this.entity.iddleStart = 0
		return true
	}
}