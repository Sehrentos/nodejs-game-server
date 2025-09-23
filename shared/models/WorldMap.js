/**
 * @typedef {Object} TWorldMapProps
 * @prop {import("../../server/src/World.js").World=} world - **Server** world instance.
 * @prop {number=} id - The id of the map.
 * @prop {number=} spriteId - The sprite ID of the map.
 * @prop {string=} name - The name of the map.
 * @prop {number=} width - The width of the map.
 * @prop {number=} height - The height of the map.
 * @prop {boolean=} isLoaded - Whether the map is loaded.
 * @prop {boolean=} isCreated - Whether the map is created.
 * @prop {boolean=} isTown - Whether the map is a town.
 * @prop {boolean=} isPVP - Whether the map has Player versus Player enabled.
 * @prop {Array<import("./Entity.js").Entity>=} entities - A list of entities.
 */

/**
 * @module WorldMap
 * @desc Represents a world map, with entities in it.
 */
export class WorldMap {
	/**
	 * Constructor for WorldMap.
	 *
	 * @param {TWorldMapProps} p - Optional properties object.
	 */
	constructor(p) {
		/** @type {import("../../server/src/World.js").World?} - **Server** world instance */
		this.world = p?.world ?? null
		/** @type {number} */
		this.id = p?.id ?? 0
		/** @type {number} */
		this.spriteId = p?.spriteId ?? 0
		/** @type {string} */
		this.name = p?.name ?? ""
		/** @type {number} */
		this.width = p?.width ?? 0
		/** @type {number} */
		this.height = p?.height ?? 0
		/** @type {boolean} */
		this.isLoaded = p?.isLoaded ?? false
		/** @type {boolean} */
		this.isCreated = p?.isCreated ?? false
		/** @type {boolean} */
		this.isTown = p?.isTown ?? false
		/** @type {boolean} */
		this.isPVP = p?.isPVP ?? false
		/** @type {Array<import("./Entity.js").Entity>} */
		this.entities = p?.entities ?? []
	}

	/**
	 * Map load method.
	 * - Used to load required assets etc.
	 * - This is called before Map.create method.
	 * - Sets the `isLoaded` property to true upon success.
	 *
	 * @returns {Promise<void>}
	 */
	async load() {
		this.isLoaded = true
	}

	/**
	 * Map create method.
	 * - Used to create map entities etc.
	 * - This is called after Map.load method.
	 * - Sets the `isCreated` property to true upon success.
	 *
	 * @returns {Promise<void>}
	 */
	async create() {
		this.isCreated = true
	}

	/**
	 * Finds entities in the given radius around a specific point.
	 * @param {import("./WorldMap.js").WorldMap} map - The map to search for entities.
	 * @param {number} x - The x-coordinate of the center point.
	 * @param {number} y - The y-coordinate of the center point.
	 * @param {number} radius - The radius to search for entities.
	 * @returns {Array<import("./Entity.js").Entity>} - An array of entities within the specified radius.
	 */
	static findEntitiesInRadius(map, x, y, radius) {
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
	 * @param {import("./WorldMap.js").WorldMap} map - The map to search for entities.
	 * @param {number} id - The entity ID to search for.
	 * @returns {import("./Entity.js").Entity|undefined} - The entity with the given ID, or `undefined` if not found.
	 */
	static findMapEntityById(map, id) {
		return map.entities.find((entity) => entity.id === id)
	}

	/**
	 * Find an entity by its GID.
	 * @param {import("./WorldMap.js").WorldMap} map - The map to search for entities.
	 * @param {string} gid - The entity Game ID to search for.
	 * @returns {import("./Entity.js").Entity|undefined} - The entity with the given ID, or `undefined` if not found.
	 */
	static findMapEntityByGid(map, gid) {
		return map.entities.find((entity) => entity.gid === gid)
	}
}
