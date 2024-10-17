import { Entity } from "../entities/Entity.js"
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
		this.entities = new Map()
	}

	// async load() {
	//     // TODO
	// }

	onCreate() {
		// create dummy NPC entities
		Array(25).fill(0).forEach((_v, i) => {
			let entity = new Entity(0, Entity.TYPE.NPC, `npc-${i}`)
			entity.x = randomIntFromInterval(5, this.width - 5)
			entity.y = randomIntFromInterval(5, this.height - 5)
			entity.dir = Math.floor(Math.random() * 4)
			entity.map = this
			this.entities.set(entity.id, entity)
		})
		// create dummy MONSTER entities
		Array(100).fill(0).forEach((_v, i) => {
			let entity = new Entity(0, Entity.TYPE.MONSTER, `mob-${i}`)
			entity.x = randomIntFromInterval(5, this.width - 5)
			entity._x = Number(entity.x)
			entity.y = randomIntFromInterval(5, this.height - 5)
			entity._y = Number(entity.y)
			entity.dir = Math.floor(Math.random() * 4)
			entity.map = this
			this.entities.set(entity.id, entity)
		})
		console.log(`WorldMap ${this.name} created with ${this.entities.size} entities.`)
	}
}