/**
 * @typedef {import("../models/WorldMap.js").WorldMap} WorldMap
 * @typedef {import("../models/Entity.js").Entity} Entity
 */

/**
 * Checks if the given coordinates (x, y) are within the range of the given entity.
 * The range is defined as the absolute difference between the entity's position and the given coordinates.
 * @param {Entity} entity - The first entity
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} range - The range
 * @returns {boolean} True if the coordinates are within the range of the entity, otherwise false.
 */
export function inRangeOf(entity, x, y, range) {
	return Math.abs(entity.lastX - x) <= range && Math.abs(entity.lastY - y) <= range
}

/**
 * Checks if the entities are within the range of each other.
 * @param {Entity} entity1 - The first entity
 * @param {Entity} entity2 - The second entity
 * @returns {boolean} True if the coordinates are within the range of the first entity, otherwise false.
 */
export function inRangeOfEntity(entity1, entity2) {
	return Math.abs(entity1.lastX - entity2.lastX) <= entity1.range && Math.abs(entity1.lastY - entity2.lastY) <= entity1.range
}

/**
 * Finds entities in the given radius around a specific point.
 * @param {WorldMap} map - The map to search for entities.
 * @param {number} x - The x-coordinate of the center point.
 * @param {number} y - The y-coordinate of the center point.
 * @param {number} radius - The radius to search for entities.
 * @returns {Array<Entity>} - An array of entities within the specified radius.
 */
export function findMapEntitiesInRadius(map, x, y, radius) {
	const stack = [] // entities can be on top of each other
	for (const entity of map.entities) {
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
 * @param {WorldMap} map - The map to search for entities.
 * @param {number} id - The entity ID to search for.
 * @returns {Entity|undefined} - The entity with the given ID, or `undefined` if not found.
 */
export function findMapEntityById(map, id) {
	return map.entities.find((entity) => entity.id === id)
}

/**
 * Find an entity by its GID.
 * @param {WorldMap} map - The map to search for entities.
 * @param {string} gid - The entity Game ID to search for.
 * @returns {Entity|undefined} - The entity with the given ID, or `undefined` if not found.
 */
export function findMapEntityByGid(map, gid) {
	return map.entities.find((entity) => entity.gid === gid)
}
