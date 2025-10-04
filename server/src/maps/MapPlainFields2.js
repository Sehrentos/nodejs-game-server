import { Entity } from '../../../shared/models/Entity.js'
import { DIR, RANGE, SIZE, TYPE } from '../../../shared/enum/Entity.js'
import { MOBS } from '../../../shared/data/MOBS.js'
import { WorldMap } from '../../../shared/models/WorldMap.js'
import { MAP_ID, MAP_NAME } from '../../../shared/enum/WorldMap.js'
import { SPR_ID } from '../../../shared/enum/Sprite.js'
import { EntityControl } from '../control/EntityControl.js'
import createGameId from '../utils/createGameId.js'
import createMonster from '../utils/createMonster.js'

// create map
export default class MapPlainFields2 extends WorldMap {
	/** @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: MAP_ID.PLAIN_FIELDS_2,
			name: MAP_NAME[MAP_ID.PLAIN_FIELDS_2],
			spriteId: SPR_ID.MAP_PLAIN_FIELDS_2,
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
				type: TYPE.PORTAL,
				lastX: 8,
				lastY: 800 / 2,
				portalId: 6,//"Plain fields 1",
				portalX: 1200 - 8 - 20, // map width - portal X position - portal width/range
				portalY: 800 / 2,
				range: RANGE.SHORT,
				size: SIZE.SMALL,
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
			...createMonster(this, 5, { ...MOBS.SNAKE }),
			// ...createMonster(this, 1, { ...MOBS.SKELETON }),
			new Entity({
				...MOBS.SKELETON,
				lastX: (this.width / 2),
				lastY: (this.height / 2),
				dir: DIR.DOWN,
				saveX: (this.width / 2),
				saveY: (this.height / 2)
			}),
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`[${this.constructor.name}] "${this.name}" is created with ${this.entities.length} entities.`)
	}
}
