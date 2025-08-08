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
			id: 7,
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
				portalName: "Plain fields 1",
				portalX: 1200 - 8 - 20, // map width - portal X position - portal width/range
				portalY: 800 / 2,
				range: 32,
				w: 32,
				h: 32,
			}),
			// to create single monsters:
			// new Entity({ ...MOBS.PLANKTON }),
			// new Entity({ ...MOBS.ORC }),
			// new Entity({ ...MOBS.ORC2 }),
			// multiple monsters:
			...createMonster(this, 10, { ...MOBS.PLANKTON }),
			...createMonster(this, 10, { ...MOBS.ORC2 }),
			...createMonster(this, 10, { ...MOBS.EYE }),
			...createMonster(this, 10, { ...MOBS.LADYBUG }),
			...createMonster(this, 10, { ...MOBS.LADYBUG2 }),
			...createMonster(this, 10, { ...MOBS.ROBOT }),
			...createMonster(this, 2, { ...MOBS.UNICORN }),
			...createMonster(this, 2, { ...MOBS.GHOST }),
			// ...createMonster(this, 1, { ...MOBS.SKELETON }),
			new Entity({ ...MOBS.SKELETON, lastX: (this.width / 2), lastY: (this.height / 2), dir: 0, saveX: (this.width / 2), saveY: (this.height / 2) }),
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`[${this.constructor.name}] "${this.name}" is created with ${this.entities.length} entities.`)
	}
}
