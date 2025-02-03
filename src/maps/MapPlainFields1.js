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
			id: 2,
			name: "Plain fields 1",
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
				portalId: 1,
				portalName: "Lobby town",
				portalX: 600 - 8 - 16,
				portalY: 400 / 2,
			}),
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: 1200 - 8,
				lastY: 800 / 2,
				portalId: 3,
				portalName: "Plain fields 2",
				portalX: 16,
				portalY: 800 / 2,
			}),
			// to create single monsters:
			// new MonsterControl({ ...MOBS[1], map: this }), // Bird
			// new MonsterControl({ ...MOBS[2], map: this }), // Bug
			// multiple monsters:
			...createMonster(this, 50, { ...MOBS[0] }), // Worm
			...createMonster(this, 50, { ...MOBS[1] }), // Bird
			...createMonster(this, 50, { ...MOBS[2] }), // Bug
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`Map ${this.name} created with ${this.entities.length} entities.`)
	}
}