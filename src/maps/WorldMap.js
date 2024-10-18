import { EntityControl } from "../control/EntityControl.js"
import { MonsterControl } from "../control/MonsterControl.js"
import { randomIntFromInterval } from "../utils/randomIntFromInterval.js"

/**
 * @module WorldMap
 * @desc Represents a world map, with entities in it.
 */
export class WorldMap {
	constructor(name = "") {
		this.name = name
		this.height = 0
		this.width = 0
		this.isLoaded = false
		/** @type {Map<string, EntityControl|MonsterControl|import("../control/PlayerControl.js").PlayerControl>} */
		this.entities = new Map()
	}

	// async load() {
	//     // TODO
	// }

	onCreate() {
		// create dummy NPC entities
		for (let i = 0; i < 25; i++) {
			let x = randomIntFromInterval(5, this.width - 5)
			let y = randomIntFromInterval(5, this.height - 5)
			let dir = Math.floor(Math.random() * 4)
			this.addNpc(0, `npc-${i}`, this, x, y, dir)
		}
		// create dummy MONSTER entities
		for (let i = 0; i < 100; i++) {
			let x = randomIntFromInterval(5, this.width - 5)
			let y = randomIntFromInterval(5, this.height - 5)
			let dir = Math.floor(Math.random() * 4)
			this.addMonster(100, `mob-${i}`, this, x, y, dir)
		}
		console.log(`WorldMap ${this.name} created with ${this.entities.size} entities.`)
	}

	addNpc(id, name, map, x, y, dir) {
		const npc = new EntityControl({ id, name, map, x, y, dir });
		this.entities.set(npc.gid, npc)
	}

	addMonster(id, name, map, x, y, dir) {
		const mob = new MonsterControl({ id, name, map, x, y, dir, savePosition: { x, y } });
		this.entities.set(mob.gid, mob)
	}
}