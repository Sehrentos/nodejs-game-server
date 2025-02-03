import { Entity } from '../model/Entity.js'
import { NPCS } from '../data/NPCS.js'
import { DIRECTION, ENTITY_TYPE } from '../enum/Entity.js'
import { WorldMap } from './WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import { createGameId } from '../utils/EntityUtil.js'

// create map
export default class MapLobbyTown extends WorldMap {
	/** @param {import("./WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 1,
			name: "Lobby town",
			width: 600,
			height: 400,
			isLoaded: true,
			...props
		})
	}

	/**
	 * Loads the map data asynchronously.
	 * Sets the map's `isLoaded` property to true upon successful loading.
	 * @returns {Promise<void>} 
	 */
	async load() {
		super.create()
		// load any assets etc.
	}

	/**
	 * Map onCreate callback
	 * @returns {Promise<void>} 
	 */
	async create() {
		super.create()
		// create map entities
		this.entities = [
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: 600 - 8,
				lastY: 400 / 2,
				portalId: 2,
				portalName: "Plain fields 1",
				portalX: 16,
				portalY: 800 / 2,
			}),
			new Entity({
				...NPCS[1], // Townsfolk
				lastX: 200,
				lastY: 250,
				dir: DIRECTION.UP,
			}),
			new Entity({
				...NPCS[2], // Blacksmith
				lastX: 269,
				lastY: 157,
				dir: DIRECTION.DOWN,
			}),
			new Entity({
				...NPCS[3], // Tool dealer
				lastX: 313,
				lastY: 160,
				dir: DIRECTION.DOWN,
			}),
			new Entity({
				...NPCS[4], // Merchant
				lastX: 216,
				lastY: 242,
				dir: DIRECTION.LEFT,
			}),
			new Entity({
				type: ENTITY_TYPE.NPC,
				name: "Stranger",
				lastX: 584,
				lastY: 233,
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

		console.log(`Map ${this.name} created with ${this.entities.length} entities.`)
	}
}