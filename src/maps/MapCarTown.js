import { Entity } from '../models/Entity.js'
import { NPCS } from '../data/NPCS.js'
import { DIRECTION, ENTITY_TYPE } from '../enum/Entity.js'
import { WorldMap } from '../models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import createGameId from '../utils/createGameId.js'

// create map
export default class MapCarTown extends WorldMap {
	/** @param {import("../models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 3,
			name: "Car town",
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
			new Entity({ // TODO fix portal positions
				type: ENTITY_TYPE.PORTAL,
				lastX: this.width - 60,
				lastY: 395,
				portalName: "Flower town",
				portalX: 80,
				portalY: 785,
				range: 32,
				w: 32,
				h: 32,
			}),
			new Entity({ // hidden portal in the lake
				type: ENTITY_TYPE.PORTAL,
				visible: false, // when hidden. no packet is sent to client in map update
				lastX: 545,
				lastY: 860,
				portalName: "Under water 1",
				portalX: 1000,
				portalY: 100,
				range: 350,
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