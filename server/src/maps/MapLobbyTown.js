import { Entity } from '../../../shared/models/Entity.js'
import { DIR, RANGE, SIZE, TYPE } from '../../../shared/enum/Entity.js'
import { MAP_ID, MAP_NAME } from '../../../shared/enum/WorldMap.js'
import { WorldMap } from '../../../shared/models/WorldMap.js'
import { NPCS } from '../../../shared/data/NPCS.js'
import { SPR_ID } from '../../../shared/enum/Sprite.js'
import { EntityControl } from '../control/EntityControl.js'
import createGameId from '../utils/createGameId.js'

// create map
export default class MapLobbyTown extends WorldMap {
	/** @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: MAP_ID.LOBBY_TOWN,
			name: MAP_NAME[MAP_ID.LOBBY_TOWN],
			spriteId: SPR_ID.MAP_LOBBY_TOWN,
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
				lastX: 20,
				lastY: 900,
				portalId: 2,//"Flower town",
				portalX: 1925,
				portalY: 770,
				range: RANGE.SHORT,
				size: SIZE.SMALL,
			}),
			new Entity({ // hidden portal in the lake (left top corner)
				type: TYPE.PORTAL,
				visible: false, // when hidden. no packet is sent to client in map update
				lastX: 205,
				lastY: 125,
				portalId: 5, //"Under water 2",
				portalX: 1000,
				portalY: 100,
				range: 150,
				size: SIZE.SMALL,
			}),
			new Entity({
				type: TYPE.PORTAL,
				lastX: 1975,
				lastY: 702,
				portalId: 6,//"Plain fields 1",
				portalX: 50,
				portalY: 800 / 2,
				range: RANGE.SHORT,
				size: SIZE.SMALL,
			}),
			new Entity({
				type: TYPE.PORTAL,
				lastX: 975,
				lastY: 25,
				portalId: 8,//"Plain fields 3",
				portalX: 2000 / 2,
				portalY: 1400 - 75,
				range: RANGE.SHORT,
				size: SIZE.SMALL,
			}),
			new Entity({
				type: TYPE.PORTAL,
				lastX: 1005,
				lastY: 1365,
				portalId: 9,//"Dungeon 1",
				portalX: 2000 / 2,
				portalY: 75,
				range: RANGE.SHORT,
				size: SIZE.SMALL,
			}),
			// NPCs
			new Entity({
				...NPCS.TOWNSFOLK,
				lastX: 960,
				lastY: 1058,
				dir: DIR.UP,
			}),
			new Entity({
				...NPCS.BLACKSMITH,
				lastX: 505,
				lastY: 665,
				dir: DIR.DOWN,
			}),
			new Entity({
				...NPCS.TOOL_DEALER,
				lastX: 1169,
				lastY: 743,
				dir: DIR.DOWN,
			}),
			new Entity({
				...NPCS.MERCHANT,
				lastX: 606,
				lastY: 698,
				dir: DIR.LEFT,
			}),
			new Entity({
				...NPCS.STRANGER,
				lastX: 1863,
				lastY: 788,
				dir: DIR.UP,
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
