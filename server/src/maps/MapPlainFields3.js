import { Entity } from '../../../shared/models/Entity.js'
import { MOBS } from '../../../shared/data/MOBS.js'
import { WorldMap } from '../../../shared/models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import { ENTITY_TYPE } from '../../../shared/enum/Entity.js'
import createGameId from '../utils/createGameId.js'
import createMonster from '../utils/createMonster.js'
import { SPR_ID } from '../../../shared/enum/Sprite.js'

// create map
export default class MapPlainFields3 extends WorldMap {
	/** @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 8,
			spriteId: SPR_ID.MAP_PLAIN_FIELDS_3,
			name: "Plain fields 3",
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
				type: ENTITY_TYPE.PORTAL,
				lastX: this.width / 2,
				lastY: this.height - 20,
				portalName: "Lobby town",
				portalX: 970,
				portalY: 154,
				range: 32,
				w: 32,
				h: 32,
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
