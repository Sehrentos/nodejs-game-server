import { Entity } from '../model/Entity.js'
import { MOBS } from '../data/MOBS.js'
import { WorldMap } from './WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import { ENTITY_TYPE } from '../enum/Entity.js'
import { createGameId, createMonster } from '../utils/EntityUtil.js'

// create map
export default class MapPlainFields1 extends WorldMap {
	/** @param {import("./WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 3,
			name: "Plain fields 2",
			width: 1200,
			height: 800,
			isLoaded: true,
			...props
		})
	}

	/**
	 * Loads the map data asynchronously
	 * @returns {Promise<void>} 
	 */
	async load() {
		super.create()
		// load any assets etc.
	}

	/**
	 * Map onCreate callback
	 * @returns {Promise<void>} 
	 */
	async create() {
		super.create()
		// create map entities
		this.entities = [
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: 8,
				lastY: 800 / 2,
				portalId: 2,
				portalName: "Plain fields 1",
				portalX: 1200 - 8 - 16,
				portalY: 800 / 2,
			}),
			// to create single monsters:
			// new MonsterControl({ ...MOBS[3] }), // Scorpio
			// new MonsterControl({ ...MOBS[4] }), // Snake
			// new MonsterControl({ ...MOBS[4] }), // Wolf
			// multiple monsters:
			...createMonster(this, 50, { ...MOBS[3] }), // Scorpio
			...createMonster(this, 50, { ...MOBS[4] }), // Snake
			...createMonster(this, 25, { ...MOBS[5] }), // Wolf
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`Map ${this.name} created with ${this.entities.length} entities.`)
	}
}