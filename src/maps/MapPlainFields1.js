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
			id: 2,
			name: "Plain fields 1",
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
				portalId: 1,
				portalName: "Lobby town",
				portalX: 1878,
				portalY: 722,
				range: 32,
				w: 32,
				h: 32,
			}),
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: 1200 - 8,
				lastY: 800 / 2,
				portalId: 3,
				portalName: "Plain fields 2",
				portalX: 20,
				portalY: 800 / 2,
				range: 32,
				w: 32,
				h: 32,
			}),
			// to create single monsters:
			// new MonsterControl({ ...MOBS[1], map: this }),
			// new MonsterControl({ ...MOBS[2], map: this }),
			// multiple monsters:
			// ...createMonster(this, 50, { ...MOBS[0] }), // Worm
			...createMonster(this, 10, { ...MOBS[1] }), // Cat
			...createMonster(this, 10, { ...MOBS[2] }), // Orc
			...createMonster(this, 10, { ...MOBS[8] }), // Dino
			...createMonster(this, 10, { ...MOBS[9] }), // Mushroom
			...createMonster(this, 10, { ...MOBS[10] }), // Wind spirit
			...createMonster(this, 10, { ...MOBS[11] }), // Slushie
			...createMonster(this, 10, { ...MOBS[12] }), // Red mushroom
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`[${this.constructor.name}] "${this.name}" is created with ${this.entities.length} entities.`)
	}
}