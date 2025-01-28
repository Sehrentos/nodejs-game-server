import { EntityControl } from "../control/EntityControl.js"
import { MonsterControl } from "../control/MonsterControl.js"
import { NPCControl } from "../control/NPCControl.js"
import { PlayerControl } from "../control/PlayerControl.js"
import { PortalControl } from "../control/PortalControl.js"
import { DIRECTION } from "../enum/Entity.js"
import { getRandomInt } from "../utils/getRandomInt.js"

/**
 * @typedef {Object} TWorldMapProps
 * @prop {import("../World.js").World=} world - World instance.
 * @prop {number=} id - The id of the map.
 * @prop {string=} name - The name of the map.
 * @prop {number=} width - The width of the map.
 * @prop {number=} height - The height of the map.
 * @prop {boolean=} isLoaded - Whether the map is loaded.
 * @prop {boolean=} isCreated - Whether the map is created.
 * @prop {Array<EntityControl|NPCControl|MonsterControl|PlayerControl|PortalControl>=} entities - A list of entities.
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
		/** @type {Array<EntityControl|NPCControl|MonsterControl|PlayerControl|PortalControl>} */
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
	 * Helper to creates a monsters.
	 * @param {number} quantity - The quantity of monsters to create
	 * @param {import("../model/Monster.js").TMonsterProps} monster - The monster to add.
	 * @returns {Array<MonsterControl>}
	 */
	createMonster(quantity, monster) {
		let i, x, y, dir
		const stack = []
		for (i = 0; i < quantity; i++) {
			x = monster.lastX || getRandomInt(5, this.width - 5)
			y = monster.lastY || getRandomInt(5, this.height - 5)
			dir = monster.dir || Math.floor(Math.random() * 4)
			stack.push(new MonsterControl({ ...monster, map: this, lastX: x, lastY: y, dir, saveX: x, saveY: y }))
		}
		return stack
	}

	/**
	 * Makes a player enter the map.
	 * If the player is already in a map, remove the player from the old map first.
	 * The player's position is set to (x, y) or the center of the map if the params are negative.
	 * The player's direction is set to 0 (south).
	 * The player is added to the map's entities list.
	 * Finally, the player's onEnterMap method is called.
	 * @param {PlayerControl} player - The player to enter the map.
	 * @param {number} [x=-1] - The x coordinate of the player's position.
	 * @param {number} [y=-1] - The y coordinate of the player's position.
	 */
	playerEnterMap(player, x = -1, y = -1) {
		if (player.map) {
			// remove player from old map
			player.map.onLeaveMap(player)
		}
		player.map = this
		// x/y coords or center of map
		player.lastMap = this.name
		player.lastX = x >= 0 ? x : Math.round(this.width / 2)
		player.lastY = y >= 0 ? y : Math.round(this.height / 2)
		player.dir = DIRECTION.DOWN
		this.entities.push(player)
		player.onEnterMap(this)
	}

	/**
	 * Removes the given player from the map's entities.
	 * @param {import("../control/PlayerControl.js").PlayerControl} player - The player to remove.
	 */
	onLeaveMap(player) {
		const inSameMap = player.map === this
		this.entities = this.entities.filter((entity) => entity.gid !== player.gid)
		if (inSameMap) console.log(`Player ${player.id} leaved ${this.name} map.`)
	}

	removeEntity(entity) {
		this.entities = this.entities.filter((e) => e.gid !== entity.gid)
	}

	/**
	 * Finds entities in the given radius around a specific point.
	 * 
	 * @param {number} x - The x-coordinate of the center point.
	 * @param {number} y - The y-coordinate of the center point.
	 * @param {number} radius - The radius to search for entities.
	 * @returns {Array<EntityControl|NPCControl|MonsterControl|PlayerControl|PortalControl>} - An array of entities within the specified radius.
	 */
	findEntitiesInRadius(x, y, radius) {
		const stack = [] // entities can be on top of each other
		for (const entity of this.entities) {
			// TODO take entity w and h into account
			if (
				(Math.abs((x - (radius / 2)) - entity.lastX) > radius || Math.abs((y - (radius / 2)) - entity.lastY) > radius) &&
				(Math.abs(x - entity.lastX) > radius || Math.abs(y - entity.lastY) > radius)
			) continue;

			stack.push(entity)
		}
		return stack
	}
}