import { Entity } from '../models/Entity.js'
import { NPCS } from '../data/NPCS.js'
import { DIRECTION, ENTITY_TYPE } from '../enum/Entity.js'
import { WorldMap } from '../models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import { createGameId } from '../utils/EntityUtil.js'

// create map
export default class MapLobbyTown extends WorldMap {
	/** @param {import("../models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 1,
			name: "Lobby town",
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
				lastX: 1975,
				lastY: 702,
				portalId: 2,
				portalName: "Plain fields 1",
				portalX: 20,
				portalY: 800 / 2,
				range: 32,
				w: 32,
				h: 32,
			}),
			new Entity({
				...NPCS[1], // Townsfolk
				lastX: 960,
				lastY: 1058,
				dir: DIRECTION.UP,
			}),
			new Entity({
				...NPCS[2], // Blacksmith
				lastX: 505,
				lastY: 665,
				dir: DIRECTION.DOWN,
			}),
			new Entity({
				...NPCS[3], // Tool dealer
				lastX: 1169,
				lastY: 743,
				dir: DIRECTION.DOWN,
			}),
			new Entity({
				...NPCS[4], // Merchant
				lastX: 606,
				lastY: 698,
				dir: DIRECTION.LEFT,
			}),
			new Entity({
				id: 1, // same as Townsfolk
				type: ENTITY_TYPE.NPC,
				name: "Stranger",
				lastX: 1863,
				lastY: 788,
				dir: DIRECTION.UP,
				dialog: `<article>
					<header>Stranger (NPC)</header>
					<p>Hmmm...?</p>
					<button class="next">Next</button>
				</article>
				<article>
					<header>Stranger</header>
					<p>Hmmm... ...</p>
					<button class="next">Next</button>
				</article>
				<article>
					<header>Stranger</header>
					<p>Hmmm... ... ...</p>
					<button class="close">X</button>
				</article>`,
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