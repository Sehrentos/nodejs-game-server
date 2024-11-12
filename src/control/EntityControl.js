import { randomBytes } from 'node:crypto';
import { Entity } from '../model/Entity.js';
import { ELEMENT } from '../enum/Element.js';
// import { ENTITY_TYPE } from '../enum/Entity.js';

/**
 * @typedef {import("./NPCControl").NPCControl | import("./MonsterControl").MonsterControl | import("./PlayerControl").PlayerControl | import("./EntityControl").EntityControl | import("./PortalControl").PortalControl} TEntityControls
 */

export class EntityControl extends Entity {
	/**
	 * Creates a new EntityControl instance.
	 * @param {import("../model/Entity.js").TEntityProps} p - Entity properties.
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
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	async onTick(timestamp) {
		// const deltaTime = timestamp - this.world.startTime // ms elapsed, since server started
		// console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)

		// call AI onUpdate, if it exists
		// this.ai?.onUpdate(timestamp)

		// find entities in nearby
		// this.detectNearByEntities(4, timestamp)
	}

	// /**
	//  * Finds entities in the given radius around the entity.
	//  * @param {number} radius - The radius to search for entities.
	//  * @param {number} timestamp `performance.now()` from the world.onTick
	//  */
	// detectNearByEntities(radius, timestamp) {
	// 	try {
	// 		const nearbyEntities = this.map.findEntitiesInRadius(this.x, this.y, radius)
	// 			.filter(entity => entity.gid !== this.gid) // exclude self
	// 		if (nearbyEntities.length === 0) return
	// 		for (const entity of nearbyEntities) {
	// 			if (entity.type === ENTITY_TYPE.PLAYER) {
	// 				// ...
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.error(`${this.constructor.name} ${this.gid} error:`, error.message || error || '[no-code]');
	// 	}
	// }

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 * Reduces the entity's health points (hp) based on the attacker's
	 * strength, attack power, and attack multiplier. If the entity's hp
	 * falls to zero or below, the entity dies and is removed from the map.
	 * 
	 * @param {import("./MonsterControl").MonsterControl | import("./PlayerControl").PlayerControl} attacker - The attacking entity, containing attack
	 *        attributes such as strength (str), attack
	 *        power (atk), and attack multiplier (atkMultiplier).
	 */
	takeDamage(attacker) {
		// must be in the same map, to receive damage
		if (this.map !== attacker.map) {
			return
		}
		if (this.hp > 0) {
			// physical attacks are always neutral? what about weapons elements?
			// TODO take defence into account
			if (attacker.eAtk === ELEMENT.NEUTRAL) {
				this.hp -= (attacker.str + attacker.atk) * attacker.atkMultiplier;
			} else {
				this.hp -= (attacker.int + attacker.mAtk) * attacker.mAtkMultiplier;
			}
		}
		if (this.hp <= 0) {
			this.die()
		}
	}

	/**
	 * Removes the entity from the map.
	 */
	die() {
		this.hp = 0
		this.mp = 0
		this.death = performance.now() // Date.now()
		// this.attacking = null
		// this.map.removeEntity(this)
	}
}