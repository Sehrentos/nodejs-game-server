import { MonsterControl } from '../control/MonsterControl.js'
import { PortalControl } from '../control/PortalControl.js'
import { MOBS } from '../data/MOBS.js'
import { WorldMap } from './WorldMap.js'

// create map
export default class MapPlainFields1 extends WorldMap {
	/** @param {import("./WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 3,
			name: "Plain fields 2",
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
				lastX: 8,
				lastY: 800 / 2,
				portalTo: { id: 2, name: "Plain fields 1", x: 1200 - 8 - 16, y: 800 / 2 },
			}),
			// to create single monsters:
			// new MonsterControl({ ...MOBS[3], map: this }), // Scorpio
			// new MonsterControl({ ...MOBS[4], map: this }), // Snake
			// new MonsterControl({ ...MOBS[4], map: this }), // Wolf
			// multiple monsters:
			...this.createMonster(50, { ...MOBS[3], map: this }), // Scorpio
			...this.createMonster(50, { ...MOBS[4], map: this }), // Snake
			...this.createMonster(25, { ...MOBS[5], map: this }), // Wolf
		]

		console.log(`Map ${this.name} created with ${this.entities.length} entities.`)
	}
}