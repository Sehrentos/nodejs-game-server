import { Entity } from '../models/Entity.js'
import { NPCS } from '../data/NPCS.js'
import { DIRECTION, ENTITY_TYPE } from '../enum/Entity.js'
import { WorldMap } from '../models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import createGameId from '../utils/createGameId.js'

// create map
export default class MapFlowerTown extends WorldMap {
	/** @param {import("../models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 2,
			name: "Flower town",
			isTown: true,
			width: 2000,
			height: 1400,
			isLoaded: true, // no assets to load
			...props
		})
	}

	/**
	 * Loads the map data asynchronously.
	 * Sets the map's `isLoaded` property to true upon successful loading.
	 * @returns {Promise<void>} 
	 */
	async load() {
		// load any assets etc.
		// ...
		this.isLoaded = true
	}

	/**
	 * Map onCreate callback
	 * @returns {Promise<void>} 
	 */
	async create() {
		this.isCreated = true
		// create map entities
		this.entities = [
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: this.width - 20,
				lastY: 785,
				portalName: "Lobby town",
				portalX: 80,
				portalY: 890,
				range: 32,
				w: 32,
				h: 32,
			}),
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: 20,
				lastY: 785,
				portalName: "Car town",
				portalX: 1980,
				portalY: 500,
				range: 32,
				w: 32,
				h: 32,
			}),
			// new Entity({
			// 	...NPCS[1], // Townsfolk
			// 	lastX: 960,
			// 	lastY: 1058,
			// 	dir: DIRECTION.UP,
			// }),
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`[${this.constructor.name}] "${this.name}" is created with ${this.entities.length} entities.`)
	}
}