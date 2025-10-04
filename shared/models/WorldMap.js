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
}
