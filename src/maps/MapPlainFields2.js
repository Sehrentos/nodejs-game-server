import { Entity } from '../models/Entity.js'
import { MOBS } from '../data/MOBS.js'
import { WorldMap } from '../models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import { ENTITY_TYPE } from '../enum/Entity.js'
import { createGameId, createMonster } from '../utils/EntityUtil.js'

// create map
export default class MapPlainFields1 extends WorldMap {
	/** @param {import("../models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 3,
			name: "Plain fields 2",
			width: 1200,
			height: 800,
			isLoaded: true, // no assets to load
			...props
		})
	}

	/**
	 * Loads the map data asynchronously
	 * @returns {Promise<void>} 
	 */
	async load() {
		// load any assets etc.
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
				lastX: 8,
				lastY: 800 / 2,
				portalId: 2,
				portalName: "Plain fields 1",
				portalX: 1200 - 8 - 20, // map width - portal X position - portal width/range
				portalY: 800 / 2,
				range: 32,
				w: 32,
				h: 32,
			}),
			// to create single monsters:
			// new Entity({ ...MOBS[3] }),
			// new Entity({ ...MOBS[4] }),
			// new Entity({ ...MOBS[4] }),
			// multiple monsters:
			...createMonster(this, 10, { ...MOBS[3] }), // Plankton
			...createMonster(this, 10, { ...MOBS[4] }), // Orc with gloves?
			...createMonster(this, 10, { ...MOBS[5] }), // The eye
			...createMonster(this, 10, { ...MOBS[6] }), // Ladybug
			...createMonster(this, 10, { ...MOBS[13] }), // Ladybug 2
			...createMonster(this, 10, { ...MOBS[14] }), // Robot 1
			// ...createMonster(this, 1, { ...MOBS[7] }), // Skeleton
			new Entity({ ...MOBS[7], lastX: (this.width / 2), lastY: (this.height / 2), dir: 0, saveX: (this.width / 2), saveY: (this.height / 2) }),
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`[${this.constructor.name}] "${this.name}" is created with ${this.entities.length} entities.`)
	}
}