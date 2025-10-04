import { Entity } from '../../../shared/models/Entity.js'
import { RANGE, SIZE, TYPE } from '../../../shared/enum/Entity.js'
import { MOBS } from '../../../shared/data/MOBS.js'
import { WorldMap } from '../../../shared/models/WorldMap.js'
import { MAP_ID, MAP_NAME } from '../../../shared/enum/WorldMap.js'
import { SPR_ID } from '../../../shared/enum/Sprite.js'
import { EntityControl } from '../control/EntityControl.js'
import createGameId from '../utils/createGameId.js'
import createMonster from '../utils/createMonster.js'

// create map
export default class MapPlainFields3 extends WorldMap {
	/** @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: MAP_ID.PLAIN_FIELDS_3,
			name: MAP_NAME[MAP_ID.PLAIN_FIELDS_3],
			spriteId: SPR_ID.MAP_PLAIN_FIELDS_3,
			width: 2000,
			height: 1400,
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
				lastX: this.width / 2,
				lastY: this.height - 20,
				portalId: 1, //"Lobby town", // TODO: rename portal/map id
				portalX: 970,
				portalY: 154,
				range: RANGE.SHORT,
				size: SIZE.SMALL,
			}),
			...createMonster(this, 10, { ...MOBS.LADYBUG }),
			...createMonster(this, 10, { ...MOBS.LADYBUG2 }),
			...createMonster(this, 10, { ...MOBS.UNICORN }),
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`[${this.constructor.name}] "${this.name}" is created with ${this.entities.length} entities.`)
	}
}
