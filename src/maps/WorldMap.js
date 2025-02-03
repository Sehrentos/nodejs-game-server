import { Entity } from "../model/Entity.js"
import { DIRECTION } from "../enum/Entity.js"

/**
 * @typedef {Object} TWorldMapProps
 * @prop {import("../World.js").World=} world - World instance.
 * @prop {number=} id - The id of the map.
 * @prop {string=} name - The name of the map.
 * @prop {number=} width - The width of the map.
 * @prop {number=} height - The height of the map.
 * @prop {boolean=} isLoaded - Whether the map is loaded.
 * @prop {boolean=} isCreated - Whether the map is created.
 * @prop {Array<Entity>=} entities - A list of entities.
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
		/** @type {import("../World.js").World?} */
		this.world = p?.world ?? null
		/** @type {number} */
		this.id = p?.id ?? 0
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
		/** @type {Array<Entity>} */
		this.entities = p?.entities ?? []
	}

	/**
	 * Map load method. Used to load required assets etc.
	 * This is called before Map.create method.
	 * Sets the map's `isLoaded` property to true upon success.
	 * 
	 * @returns {Promise<void>} 
	 */
	async load() {
		this.isLoaded = true
	}

	/**
	 * Map create method. Used to create map entities etc.
	 * This is called after Map.load method.
	 * Sets the map's `isCreated` property to true upon success.
	 * 
	 * @returns {Promise<void>} 
	 */
	async create() {
		this.isCreated = true
	}

	/**
	 * Makes a player enter the map.
	 * If the player is already in a map, remove the player from the old map first.
	 * The player's position is set to (x, y) or the center of the map if the params are negative.
	 * The player's direction is set to 0 (south).
	 * The player is added to the map's entities list.
	 * Finally, the player's onEnterMap method is called.
	 * @param {Entity} player - The player to enter the map.
	 * @param {number} [x=-1] - The x coordinate of the player's position.
	 * @param {number} [y=-1] - The y coordinate of the player's position.
	 */
	playerEnterMap(player, x = -1, y = -1) {
		if (player.control.map) {
			// remove player from old map
			player.control.map.onLeaveMap(player)
		}
		// important set control map
		player.control.map = this
		// x/y coords or center of map
		player.lastMap = this.name
		player.lastX = x >= 0 ? x : Math.round(this.width / 2)
		player.lastY = y >= 0 ? y : Math.round(this.height / 2)
		player.dir = DIRECTION.DOWN
		this.entities.push(player)
		player.control.onEnterMap(this)
	}

	/**
	 * Removes the given player from the map's entities.
	 * @param {Entity} player - The player to remove.
	 */
	onLeaveMap(player) {
		this.removeEntity(player)
		// is in same map
		if (player.control.map === this) console.log(`Player ${player.id} leaved ${this.name} map.`)
	}

	/**
	 * Removes the given entity from the map's entities.
	 * 
	 * Note: This method has to be in the Map class, 
	 * Because i had some issues removing entities outside of the map class.
	 * 
	 * @param {Entity} entity - The entity to remove.
	 */
	removeEntity(entity) {
		this.entities = this.entities.filter((e) => e.gid !== entity.gid)
	}
}