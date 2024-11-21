import { NPCControl } from '../control/NPCControl.js'
import { PortalControl } from '../control/PortalControl.js'
import { NPCS } from '../data/NPCS.js'
import { DIRECTION } from '../enum/Entity.js'
import { WorldMap } from './WorldMap.js'

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
			new PortalControl({
				map: this,
				x: 600 - 8,
				y: 400 / 2,
				portalTo: { id: 2, name: "Plain fields 1", x: 16, y: 800 / 2 },
			}),
			new NPCControl({
				...NPCS[1], // Townsfolk
				map: this,
				x: 200,
				y: 250,
				dir: DIRECTION.UP,
			}),
			new NPCControl({
				...NPCS[2], // Blacksmith
				map: this,
				x: 269,
				y: 157,
				dir: DIRECTION.DOWN,
			}),
			new NPCControl({
				...NPCS[3], // Tool dealer
				map: this,
				x: 313,
				y: 160,
				dir: DIRECTION.DOWN,
			}),
			new NPCControl({
				...NPCS[4], // Merchant
				map: this,
				x: 216,
				y: 242,
				dir: DIRECTION.LEFT,
			}),
			new NPCControl({
				map: this,
				name: "Stranger",
				x: 584,
				y: 233,
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

		console.log(`Map ${this.name} created with ${this.entities.length} entities.`)
	}
}