import { Entity } from '../../../shared/models/Entity.js'
import { NPCS } from '../../../shared/data/NPCS.js'
import { DIRECTION, ENTITY_TYPE } from '../../../shared/enum/Entity.js'
import { WorldMap } from '../../../shared/models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import createGameId from '../utils/createGameId.js'
import { SPR_ID } from '../../../shared/enum/Sprite.js'

// create map
export default class MapLobbyTown extends WorldMap {
	/** @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 1,
			spriteId: SPR_ID.MAP_LOBBY_TOWN,
			name: "Lobby town",
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
				type: ENTITY_TYPE.PORTAL,
				lastX: 20,
				lastY: 900,
				portalName: "Flower town",
				portalX: 1925,
				portalY: 770,
				range: 32,
				w: 32,
				h: 32,
			}),
			new Entity({ // hidden portal in the lake (left top corner)
				type: ENTITY_TYPE.PORTAL,
				visible: false, // when hidden. no packet is sent to client in map update
				lastX: 205,
				lastY: 125,
				portalName: "Under water 2",
				portalX: 1000,
				portalY: 100,
				range: 150,
				w: 32,
				h: 32,
			}),
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: 1975,
				lastY: 702,
				portalName: "Plain fields 1",
				portalX: 50,
				portalY: 800 / 2,
				range: 32,
				w: 32,
				h: 32,
			}),
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: 975,
				lastY: 25,
				portalName: "Plain fields 3",
				portalX: 2000 / 2,
				portalY: 1400 - 75,
				range: 32,
				w: 32,
				h: 32,
			}),
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: 1005,
				lastY: 1365,
				portalName: "Dungeon 1",
				portalX: 2000 / 2,
				portalY: 75,
				range: 32,
				w: 32,
				h: 32,
			}),
			// NPCs
			new Entity({
				...NPCS.TOWNSFOLK,
				lastX: 960,
				lastY: 1058,
				dir: DIRECTION.UP,
			}),
			new Entity({
				...NPCS.BLACKSMITH,
				lastX: 505,
				lastY: 665,
				dir: DIRECTION.DOWN,
			}),
			new Entity({
				...NPCS.TOOL_DEALER,
				lastX: 1169,
				lastY: 743,
				dir: DIRECTION.DOWN,
			}),
			new Entity({
				...NPCS.MERCHANT,
				lastX: 606,
				lastY: 698,
				dir: DIRECTION.LEFT,
			}),
			new Entity({
				...NPCS.STRANGER,
				lastX: 1863,
				lastY: 788,
				dir: DIRECTION.UP,
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
