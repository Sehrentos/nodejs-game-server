import { randomBytes } from 'node:crypto';
import { Monster } from '../model/Monster.js';
import { AI } from '../AI.js';

export class MonsterControl extends Monster {
	/**
	 * Creates a new MonsterControl instance.
	 * @param {import("../model/Monster.js").MonsterProps} p - Monster properties.
	 */
	constructor(p) {
		super(p)
		this.gid = p?.gid ?? randomBytes(16).toString('hex')
		this.ai = new AI(this)
	}

	/**
	 * Function to handle the movement of a monster entity on each tick.
	 * It checks if the entity can move, updates its position based on speed and direction,
	 * and ensures it stays within the map boundaries and doesn't move excessively from the original position.
	 * 
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	onTick(timestamp) {
		// const deltaTime = timestamp - this.world.startTime // ms elapsed, since server started
		// console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)
		this.ai.onUpdate(timestamp)
	}
}