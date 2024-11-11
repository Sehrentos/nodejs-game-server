import { EntityControl } from "./control/EntityControl.js"
import { MonsterControl } from "./control/MonsterControl.js"
import { NPCControl } from "./control/NPCControl.js"
import { PlayerControl } from "./control/PlayerControl.js"
import { PortalControl } from "./control/PortalControl.js"
import { MAPS } from "./data/MAPS.js"
import { MOBS } from "./data/MOBS.js"
import { NPCS } from "./data/NPCS.js"
import { ENTITY_TYPE } from "./enum/Entity.js"
import { getRandomInt } from "./utils/getRandomInt.js"

/**
 * @typedef {Object} WorldMapProps
 * @prop {number=} id - The id of the map.
 * @prop {string=} name - The name of the map.
 * @prop {number=} width - The width of the map.
 * @prop {number=} height - The height of the map.
 * @prop {boolean=} isLoaded - Whether the map is loaded.
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
	 * @param {import("./World.js").World} world - The world object.
	 * @param {WorldMapProps} p - Optional properties object.
	 */
	constructor(world, p) {
		/** @type {import("./World.js").World} */
		this.world = world
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
		/** @type {Array<EntityControl|NPCControl|MonsterControl|PlayerControl|PortalControl>} */
		this.entities = p?.entities ?? []
	}

	/**
	 * Loads the map data asynchronously.
	 * Sets the map's `isLoaded` property to true upon successful loading.
	 * 
	 * @returns {Promise<WorldMap>} The current instance of the WorldMap.
	 */
	async load() {
		// TODO load any map data, below is just for example success response
		// this.id = ???
		this.isLoaded = true
		console.log(`[TODO] WorldMap '${this.name}' loaded.`)
		return this
	}

	onCreate() {
		// create map entities from static data
		for (const map of MAPS) {
			if (map.name !== this.name) continue;

			let entityStack = []

			// instantiate the Objects with proper controllers
			for (const entity of map.entities) {
				let _entityClone = structuredClone(entity)
				let _quantity = entity.quantity || 1;
				let x = entity.x || getRandomInt(5, this.width - 5)
				let y = entity.y || getRandomInt(5, this.height - 5)
				let dir = entity.dir || Math.floor(Math.random() * 4)
				let _entity = { ..._entityClone, map: this, x, y, dir, saveX: x, saveY: y }
				switch (_entity.type) {
					default:
						entityStack.push(new EntityControl(_entity))
						break;

					case ENTITY_TYPE.NPC:
						entityStack.push(new NPCControl(_entity))
						break;

					case ENTITY_TYPE.MONSTER:
						let _mob = MOBS.find(e => e.id === _entity.id)
						if (!_mob) continue
						let _mobClone = structuredClone(_mob)
						for (let i = 0; i < _quantity; i++) {
							// @ts-ignore
							_entity = { ..._mobClone, ..._entityClone, map: this, x, y, dir, saveX: x, saveY: y }
							entityStack.push(new MonsterControl(_entity))
							// use new positions on next loop
							x = entity.x || getRandomInt(5, this.width - 5)
							y = entity.y || getRandomInt(5, this.height - 5)
							dir = entity.dir || Math.floor(Math.random() * 4)
						}
						break;

					case ENTITY_TYPE.PLAYER:
						entityStack.push(new PlayerControl(_entity))
						break;

					case ENTITY_TYPE.WARP_PORTAL:
						// @ts-ignore portalTo exist, when type is PORTAL, else it will be created
						entityStack.push(new PortalControl(_entity))
						break;
				}
			}
			// @ts-ignore quantity is removed
			this.entities = entityStack
		}

		// // [TEST] create dummy NPC entities
		// for (let i = 0; i < 25; i++) {
		// 	let x = getRandomInt(5, this.width - 5)
		// 	let y = getRandomInt(5, this.height - 5)
		// 	let dir = Math.floor(Math.random() * 4)
		// 	// get random NPC between id 1 and MAX
		// 	let randomNPC = NPCS[getRandomInt(0, NPCS.length - 1)]
		// 	this.addNpc(randomNPC, x, y, dir)
		// }
		// // [TEST] create dummy MONSTER entities
		// for (let i = 0; i < 100; i++) {
		// 	let x = getRandomInt(5, this.width - 5)
		// 	let y = getRandomInt(5, this.height - 5)
		// 	let dir = Math.floor(Math.random() * 4)
		// 	// get random Mob between id 1 and MAX
		// 	let randomMob = MOBS[getRandomInt(0, MOBS.length - 1)]
		// 	this.addMonster(randomMob, x, y, dir)
		// }

		console.log(`WorldMap ${this.name} created with ${this.entities.length} entities.`)
	}

	/**
	 * Adds an NPC to the map at the specified coordinates with the given direction.
	 * 
	 * @param {import("./model/NPC.js").TNPCProps} entity - The entity to add as an NPC.
	 * @param {number} x - The x coordinate
	 * @param {number} y - The y coordinate
	 * @param {number} dir - The direction
	 */
	addNpc(entity, x, y, dir) {
		this.entities.push(new NPCControl({ ...entity, map: this, x, y, dir, saveX: x, saveY: y }))
	}

	/**
	 * Adds a monster to the map at the given coordinates with the specified direction.
	 * @param {import("./model/Monster.js").TMonsterProps} monster - The monster to add.
	 * @param {number} x - The x coordinate
	 * @param {number} y - The y coordinate
	 * @param {number} dir - The direction
	 */
	addMonster(monster, x, y, dir) {
		this.entities.push(new MonsterControl({ ...monster, map: this, x, y, dir, saveX: x, saveY: y }))
	}

	/**
	 * Adds a player to the map at the given coordinates with the specified direction.
	 * @param {import("./model/Player.js").TPlayerProps} player - The monster to add.
	 * @param {number} x - The x coordinate
	 * @param {number} y - The y coordinate
	 * @param {number} dir - The direction
	 */
	addPlayer(player, x, y, dir) {
		this.entities.push(new PlayerControl({ ...player, map: this, x, y, dir, saveX: x, saveY: y }))
	}

	/**
	 * Adds a portal to the map at the given coordinates with the specified direction.
	 * @param {import("./model/Portal.js").TPortalProps} portal - The portal to add.
	 * @param {number} x - The x coordinate
	 * @param {number} y - The y coordinate
	 */
	addPortal(portal, x, y) {
		this.entities.push(new PortalControl({ ...portal, map: this, x, y, saveX: x, saveY: y }))
	}

	/**
	 * Enters the map with the given player at the specified coordinates.
	 * If no coordinates are given, the player is placed at the center of the map.
	 * @param {import("./control/PlayerControl.js").PlayerControl} player - The player to enter the map.
	 * @param {number} [x=-1] - The x-coordinate to place the player. Defaults to -1.
	 * @param {number} [y=-1] - The y-coordinate to place the player. Defaults to -1.
	 */
	enterMap(player, x = -1, y = -1) {
		if (player.map) {
			// remove player from old map
			player.map.onLeaveMap(player)
		}
		player.map = this
		// x/y coords or center of map
		player.x = x >= 0 ? x : Math.round(this.width / 2)
		player.y = y >= 0 ? y : Math.round(this.height / 2)
		player.dir = 0
		this.onEnterMap(player)
	}

	/**
	 * Adds the given player to the map's entities.
	 * @param {import("./control/PlayerControl.js").PlayerControl} player - The player to add.
	 */
	onEnterMap(player) {
		this.entities.push(player)
		console.log(`Player ${player.id} entered ${this.name} map.`)
		player.onEnterMap(this)
	}

	/**
	 * Removes the given player from the map's entities.
	 * @param {import("./control/PlayerControl.js").PlayerControl} player - The player to remove.
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
				(Math.abs((x - (radius / 2)) - entity.x) > radius || Math.abs((y - (radius / 2)) - entity.y) > radius) &&
				(Math.abs(x - entity.x) > radius || Math.abs(y - entity.y) > radius)
			) continue;

			stack.push(entity)
		}
		return stack
	}
}