import { Entity } from '../models/Entity.js';
import { getRandomInt } from './getRandomInt.js';

/**
 * Helper to creates monsters.
 * @param {import("../models/WorldMap.js").WorldMap} map - The map to use as reference.
 * @param {number} quantity - The quantity of monsters to create
 * @param {import("../models/Entity.js").TEntityProps} monster - The monster to add.
 * @returns {Array<Entity>}
 */
export default function createMonster(map, quantity, monster) {
	let i, x, y, dir, mob
	const stack = []
	for (i = 0; i < quantity; i++) {
		x = monster.lastX || getRandomInt(5, map.width - 5)
		y = monster.lastY || getRandomInt(5, map.height - 5)
		dir = monster.dir || Math.floor(Math.random() * 4)
		//gid = createGameId()
		mob = new Entity({ ...monster, lastX: x, lastY: y, dir, saveX: x, saveY: y })
		// Note: this is already set in the maps, where the entities are created
		//mob.control = new EntityControl(mob, this.world, null, this)
		stack.push(mob)
	}
	return stack
}
