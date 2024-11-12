/**
 * Revives the entity by restoring their health points (hp) and
 * mana points (mp) to their maximum values (hpMax and mpMax).
 * @param {import("../model/Entity").TEntityProps} entity - The entity.
 */
export function reviveEntity(entity) {
	entity.hp = Number(entity.hpMax)
	entity.mp = Number(entity.mpMax)
}

/**
 * Checks if the given coordinates (x, y) are within the range of the given entity.
 * The range is defined as the absolute difference between the entity's position and the given coordinates.
 * @param {import("../model/Entity").TEntityProps} entity - The entity.
 * @param {number} x - The x-coordinate of the point to check.
 * @param {number} y - The y-coordinate of the point to check.
 * @param {number} range - The range to check against.
 * @returns {boolean} True if the coordinates are within the range of the entity, otherwise false.
 */
export function inRangeOfEntity(entity, x, y, range) {
	return Math.abs(entity.x - x) <= range && Math.abs(entity.y - y) <= range
}

/**
 * Moves the entity in the specified direction if possible.
 * The movement is based on the entity's direction and current speed.
 * Updates the entity's position on the map while ensuring it stays within boundaries.
 * The movement is constrained by a delay calculated from speed and speedMultiplier.
 * @param {import("../control/PlayerControl").PlayerControl|import("../control/MonsterControl").MonsterControl} entity - The entity.
 * @param {number} dir - The direction to move the entity:
 *   0: Left (x--), 1: Right (x++), 2: Up (y--), 3: Down (y++)
 * @param {number=} timestamp - The current timestamp or performance.now().
 */
export function moveEntity(entity, dir, timestamp) {
	if (entity.hp <= 0) return // must be alive
	const _timestamp = timestamp || performance.now()

	// check if entity can move on this tick
	if (entity.movementStart === 0) {
		// can move
	} else if (_timestamp - entity.movementStart < entity.speed * entity.speedMultiplier) {
		return
	}
	entity.movementStart = _timestamp

	switch (dir) {
		case 0:
			entity.dir = 0
			if (entity.x > 0) {
				entity.x--
			}
			break
		case 1:
			entity.dir = 1
			if (entity.x < entity.map.width) {
				entity.x++
			}
			break
		case 2:
			entity.dir = 2
			if (entity.y > 0) {
				entity.y--
			}
			break
		case 3:
			entity.dir = 3
			if (entity.y < entity.map.height) {
				entity.y++
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
 * @param {import("../control/PlayerControl").PlayerControl|import("../control/MonsterControl").MonsterControl} self - Who is following.
 * @param {import("../model/Entity").TEntityProps} target - The target entity to follow.
 * @param {number=} timestamp - The current timestamp or performance.now().
 */
export function followEntity(self, target, timestamp) {
	if (self.hp <= 0) return
	const _timestamp = timestamp || performance.now()
	self._following = target

	// check if entity can move on this tick
	if (self.movementStart === 0) {
		// can move
	} else if (_timestamp - self.movementStart < self.speed * self.speedMultiplier) {
		return
	}
	self.movementStart = _timestamp

	// if target dies, stop following
	if (target.hp <= 0) {
		self._following = null
		return
	}

	// stop at range
	if (inRangeOfEntity(target, self.x, self.y, self.range)) {
		self._following = null
		return
	}

	// follow target
	if (self.x > target.x) {
		self.dir = 0
		self.x--
	} else if (self.x < target.x) {
		self.dir = 1
		self.x++
	}
	if (self.y > target.y) {
		self.dir = 2
		self.y--
	} else if (self.y < target.y) {
		self.dir = 3
		self.y++
	}
}