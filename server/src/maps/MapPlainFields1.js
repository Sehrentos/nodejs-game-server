import { Entity } from '../../../shared/models/Entity.js'
import { MOBS } from '../../../shared/data/MOBS.js'
import { WorldMap } from '../../../shared/models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import { ENTITY_TYPE } from '../../../shared/enum/Entity.js'
import createGameId from '../utils/createGameId.js'
import createMonster from '../utils/createMonster.js'

// create map
export default class MapPlainFields1 extends WorldMap {
	/** @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 6,
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
				portalName: "Plain fields 2",
				portalX: 20,
				portalY: 800 / 2,
				range: 32,
				w: 32,
				h: 32,
			}),
			// to create single monsters:
			// new MonsterControl({ ...MOBS.CAT, map: this }),
			// new MonsterControl({ ...MOBS.ORC, map: this }),
			// multiple monsters:
			// ...createMonster(this, 50, { ...MOBS.DEFAULT }), // Worm
			...createMonster(this, 10, { ...MOBS.CAT }),
			...createMonster(this, 10, { ...MOBS.ORC }),
			...createMonster(this, 10, { ...MOBS.DINOSAUR }),
			...createMonster(this, 10, { ...MOBS.MUSHROOM }),
			...createMonster(this, 10, { ...MOBS.WIND_SPIRIT }),
			...createMonster(this, 10, { ...MOBS.SLUSHIE }),
			...createMonster(this, 10, { ...MOBS.RED_MUSHROOM }),
			...createMonster(this, 5, { ...MOBS.SNAKE }),
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`[${this.constructor.name}] "${this.name}" is created with ${this.entities.length} entities.`)
	}
}
