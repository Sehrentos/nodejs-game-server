/**
 * @typedef {import("../../src/model/Entity.js").TEntityProps} EntityProps
 * 
 * @typedef {Object} WMapProps
 * @prop {number=} id - Database id.
 * @prop {string=} name - Visual name.
 * @prop {number=} width - The width of the map.
 * @prop {number=} height - The height of the map.
 * @prop {Array<EntityProps>=} entities - A list of entities.
 */
/**
 * @module WMap
 * @desc Represents a world map, with entities in it.
 * @type {WMapProps}
 */
export default class WMap {
	constructor(p) {
		/** @type {number} */
		this.id = p?.id ?? 0
		/** @type {string} */
		this.name = p?.name ?? ""
		/** @type {number} */
		this.width = p?.width ?? 0
		/** @type {number} */
		this.height = p?.height ?? 0
		/** @type {Array<EntityProps>} */
		this.entities = p?.entities ?? []
	}

	/**
	 * handle the map state update
	 * 
	 * @param {import("../../src/Packets.js").TWorldMap} data
	 */
	update(data) {
		// merge the server data to the current state
		// TODO merge needs to be deep?
		Object.assign(this, data) // naive approach
	}

	/**
	 * Finds entities in the given radius around a specific point.
	 * 
	 * @param {WMapProps} map - The map to search.
	 * @param {number} x - The x-coordinate of the center point.
	 * @param {number} y - The y-coordinate of the center point.
	 * @param {number} radius - The radius to search for entities.
	 * @returns {Array} - An array of entities within the specified radius.
	 */
	static findEntitiesInRadius(map, x, y, radius) {
		const stack = [] // entities can be on top of each other
		if (map == null) return stack
		const entities = map.entities
		let _x, _y
		for (const entity of entities) {
			_x = entity.lastX
			_y = entity.lastY
			// if (Math.abs(x - _x) > radius || Math.abs(y - _y) > radius) continue
			if ((Math.abs((x - (radius / 2)) - _x) > radius || Math.abs((y - (radius / 2)) - _y) > radius) &&
				(Math.abs(x - _x) > radius || Math.abs(y - _y) > radius)) {
				continue;
			}
			stack.push(entity)
		}
		return stack
	}
}