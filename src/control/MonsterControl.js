import { randomBytes } from 'node:crypto';
import { Monster } from '../model/Monster.js';
import { AI } from '../AI.js';
import { ELEMENT } from '../enum/Element.js';

export class MonsterControl extends Monster {
	/**
	 * Creates a new MonsterControl instance.
	 * @param {import("../model/Monster.js").MonsterProps} p - Monster properties.
	 */
	constructor(p) {
		super(p)
		this.gid = p?.gid ?? randomBytes(16).toString('hex')
		this.ai = new AI(this)
		this.aspd = p?.aspd ?? 1000
		this.aspdMultiplier = p?.aspdMultiplier ?? 1
		/** @type {number} timestamp in milliseconds when the player last attacked */
		this.attackStart = 0
		/** @type {import("./EntityControl.js").TEntityControls|null} */
		this.attacking = null
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

		// call AI onUpdate, if it exists
		this.ai.onUpdate(timestamp)

		// find entities in nearby
		// this.detectNearByEntities(4, timestamp)
	}

	// /**
	//  * Finds entities in the given radius around the entity.
	//  * @param {number} [radius=4] - The radius to search for entities.
	//  * @param {number} [timestamp=performance.now()] `performance.now()` from the world.onTick
	//  */
	// detectNearByEntities(radius = 4, timestamp = performance.now()) {
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
	 * Controls the attack logic of the entity.
	 * 
	 * @param {import("./EntityControl.js").TEntityControls} entity - The target entity to attack.
	 * @param {number} timestamp - The current timestamp in milliseconds.
	 */
	attack(entity, timestamp) {
		this.inCombat = true
		if (this.attackStart !== 0 && timestamp - this.attackStart < this.aspd * this.aspdMultiplier) {
			return // can't attack yet
		}
		this.attackStart = timestamp

		// @ts-ignore null checked. perform attack
		entity?.takeDamage(this)
	}

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 * Reduces the entity's health points (hp) based on the attacker's
	 * strength, attack power, and attack multiplier. If the entity's hp
	 * falls to zero or below, the entity dies and is removed from the map.
	 * 
	 * @param {import("./EntityControl.js").TEntityControls} attacker - The attacking entity, containing attack
	 *                            attributes such as strength (str), attack
	 *                            power (atk), and attack multiplier (atkMultiplier).
	 */
	takeDamage(attacker) {
		// must be in the same map, to receive damage
		if (this.map !== attacker.map) {
			return
		}
		if (this.hp > 0) {
			// physical attacks are always neutral?
			// TODO take defence into account
			if (attacker.elementAtk === ELEMENT.NEUTRAL) {
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
		this.map.removeEntity(this)
	}
}