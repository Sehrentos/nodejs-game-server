import { Entity } from '../../../shared/models/Entity.js'
import { RANGE, SIZE, TYPE } from '../../../shared/enum/Entity.js'
import { MAP_ID, MAP_NAME } from '../../../shared/enum/WorldMap.js'
import { WorldMap } from '../../../shared/models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import createGameId from '../utils/createGameId.js'
import { SPR_ID } from '../../../shared/enum/Sprite.js'

// create map
export default class MapCarTown extends WorldMap {
	/** @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: MAP_ID.CAR_TOWN,
			name: MAP_NAME[MAP_ID.CAR_TOWN],
			spriteId: SPR_ID.MAP_CAR_TOWN,
			isTown: true,
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
			new Entity({
				type: TYPE.PORTAL,
				lastX: this.width - 60,
				lastY: 395,
				portalId: 2,//"Flower town",
				portalX: 80,
				portalY: 785,
				range: RANGE.SHORT,
				size: SIZE.SMALL,
			}),
			new Entity({ // hidden portal in the lake
				type: TYPE.PORTAL,
				visible: false, // when hidden. no packet is sent to client in map update
				lastX: 545,
				lastY: 860,
				portalId: 4, //"Under water 1",
				portalX: 1000,
				portalY: 100,
				range: 350,
				size: SIZE.SMALL,
			}),
			// new Entity({
			// 	...NPCS.TOWNSFOLK,
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
