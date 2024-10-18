import { randomBytes } from 'node:crypto';
import { Entity } from '../data/Entity.js';

export class EntityControl extends Entity {
	/**
	 * Creates a new EntityControl instance.
	 * @param {import("../data/Entity.js").EntityProps} p - Entity properties.
	 */
	constructor(p) {
		super(p)
		this.gid = p?.gid ?? randomBytes(16).toString('hex')
	}

	/**
	 * Function to handle the movement of a monster entity on each tick.
	 * It checks if the entity can move, updates its position based on speed and direction,
	 * and ensures it stays within the map boundaries and doesn't move excessively from the original position.
	 * 
	 * @param {number} startTime server start time
	 * @param {number} updateTime last update time
	 */
	onTick(startTime, updateTime) {
		// const deltaTime = performance.now() - startTime // ms elapsed, since server started
		// const deltaUpdateTime = performance.now() - updateTime // ms elapsed, since last server update
		// this.ai?.onUpdate(startTime, updateTime)
	}

	// onCreate() {}

	// onDelete() {
	// 	console.log(`Entity ${this.id} delete.`)
	// }
}