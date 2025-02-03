import { randomBytes } from 'node:crypto';
import { Entity } from '../model/Entity.js';
import { getRandomInt } from './getRandomInt.js';

/**
 * Creates a new game ID `(gid)`
 * @returns {string}
 */
export function createGameId() {
	return randomBytes(16).toString('hex')
}

/**
 * Revives the entity by restoring their health points (hp) and
 * mana points (mp) to their maximum values (hpMax and mpMax).
 * @param {Entity} entity - The entity.
 */
export function reviveEntity(entity) {
	entity.hp = Number(entity.hpMax)
	entity.mp = Number(entity.mpMax)
}

/**
 * Checks if the given coordinates (x, y) are within the range of the given entity.
 * The range is defined as the absolute difference between the entity's position and the given coordinates.
 * @param {Entity} entity - The first entity
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} range - The range
 * @returns {boolean} True if the coordinates are within the range of the entity, otherwise false.
 */
export function inRangeOfEntity(entity, x, y, range) {
	return Math.abs(entity.lastX - x) <= range && Math.abs(entity.lastY - y) <= range
}

/**
 * Checks if the entities are within the range of each other.
 * @param {Entity} entity1 - The first entity
 * @param {Entity} entity2 - The second entity
 * @returns {boolean} True if the coordinates are within the range of the first entity, otherwise false.
 */
export function entityInRangeOfEntity(entity1, entity2) {
	return Math.abs(entity1.lastX - entity2.lastX) <= entity1.range && Math.abs(entity1.lastY - entity2.lastY) <= entity1.range
}

/**
 * Finds entities in the given radius around a specific point.
 * @param {import("../maps/WorldMap").WorldMap} map - The map to search for entities.
 * @param {number} x - The x-coordinate of the center point.
 * @param {number} y - The y-coordinate of the center point.
 * @param {number} radius - The radius to search for entities.
 * @returns {Array<Entity>} - An array of entities within the specified radius.
 */
export function findMapEntitiesInRadius(map, x, y, radius) {
	const stack = [] // entities can be on top of each other
	for (const entity of map.entities) {
		// TODO take entity w and h into account
		if (
			(Math.abs((x - (radius / 2)) - entity.lastX) > radius || Math.abs((y - (radius / 2)) - entity.lastY) > radius) &&
			(Math.abs(x - entity.lastX) > radius || Math.abs(y - entity.lastY) > radius)
		) continue;

		stack.push(entity)
	}
	return stack
}

/**
 * Find an entity by its ID.
 * @param {import("../maps/WorldMap").WorldMap} map - The map to search for entities.
 * @param {number} id - The entity ID to search for.
 * @returns {Entity} - The entity with the given ID, or `undefined` if not found.
 */
export function findMapEntityById(map, id) {
	return map.entities.find((entity) => entity.id === id)
}

/**
 * Find an entity by its GID.
 * @param {import("../maps/WorldMap").WorldMap} map - The map to search for entities.
 * @param {string} gid - The entity Game ID to search for.
 * @returns {Entity} - The entity with the given ID, or `undefined` if not found.
 */
export function findMapEntityByGid(map, gid) {
	return map.entities.find((entity) => entity.gid === gid)
}

/**
 * Helper to creates monsters.
 * @param {import("../maps/WorldMap").WorldMap} map - The map to use as reference.
 * @param {number} quantity - The quantity of monsters to create
 * @param {import("../model/Entity.js").TEntityProps} monster - The monster to add.
 * @returns {Array<Entity>}
 */
export function createMonster(map, quantity, monster) {
	let i, x, y, dir, mob
	const stack = []
	for (i = 0; i < quantity; i++) {
		x = monster.lastX || getRandomInt(5, map.width - 5)
		y = monster.lastY || getRandomInt(5, map.height - 5)
		dir = monster.dir || Math.floor(Math.random() * 4)
		//gid = createGameId()
		mob = new Entity({ ...monster, lastX: x, lastY: y, dir, saveX: x, saveY: y })
		// Note: this is already set in the maps, where the entities are created
		//mob.control = new EntityControl(mob, this.world, null, this)
		stack.push(mob)
	}
	return stack
}
