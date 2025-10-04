import { Entity } from '../../../shared/models/Entity.js'
import { RANGE, SIZE, TYPE } from '../../../shared/enum/Entity.js'
import { MAP_ID, MAP_NAME } from '../../../shared/enum/WorldMap.js'
import { WorldMap } from '../../../shared/models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import createGameId from '../utils/createGameId.js'
import { SPR_ID } from '../../../shared/enum/Sprite.js'

// create map
export default class MapFlowerTown extends WorldMap {
	/** @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: MAP_ID.FLOWER_TOWN,
			name: MAP_NAME[MAP_ID.FLOWER_TOWN],
			spriteId: SPR_ID.MAP_FLOWER_TOWN,
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
				lastX: this.width - 20,
				lastY: 785,
				portalId: 1,//"Lobby town",
				portalX: 80,
				portalY: 890,
				range: RANGE.SHORT,
				size: SIZE.SMALL,
			}),
			new Entity({
				type: TYPE.PORTAL,
				lastX: 20,
				lastY: 785,
				portalId: 3,//"Car town",
				portalX: 1980,
				portalY: 500,
				range: RANGE.SHORT,
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
