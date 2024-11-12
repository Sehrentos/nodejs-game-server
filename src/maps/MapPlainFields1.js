import { MonsterControl } from '../control/MonsterControl.js'
import { PortalControl } from '../control/PortalControl.js'
import { MOBS } from '../data/MOBS.js'
import { WorldMap } from './WorldMap.js'

// create map
export default class MapPlainFields1 extends WorldMap {
	/** @param {import("./WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 2,
			name: "Plain fields 1",
			width: 1200,
			height: 800,
			isLoaded: true,
			...props
		})
	}

	/**
	 * Loads the map data asynchronously
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
				x: 8,
				y: 800 / 2,
				portalTo: { id: 1, name: "Lobby town", x: 600 - 8 - 16, y: 400 / 2 },
			}),
			new PortalControl({
				map: this,
				x: 1200 - 8,
				y: 800 / 2,
				portalTo: { id: 3, name: "Plain fields 2", x: 16, y: 800 / 2 },
			}),
			// to create single monsters:
			// new MonsterControl({ ...MOBS[1], map: this }), // Bird
			// new MonsterControl({ ...MOBS[2], map: this }), // Bug
			// multiple monsters:
			...this.createMonster(50, { ...MOBS[0], map: this }), // Worm
			...this.createMonster(50, { ...MOBS[1], map: this }), // Bird
			...this.createMonster(50, { ...MOBS[2], map: this }), // Bug
		]

		console.log(`Map ${this.name} created with ${this.entities.length} entities.`)
	}
}