import { Entity } from "./Entity.js";
import { ENTITY_TYPE } from "../enum/Entity.js";

/**
 * @typedef {Object} EntityExtras
 * @prop {number=} type - Entity type. default ENTITY_TYPE.MONSTER
 * @prop {number=} speed - Speed. default 400
 * @prop {boolean=} inCombat - In combat. default false
 * @prop {number=} iddleStart - Iddle start time. default 0
 * @typedef {import("./Entity.js").EntityProps & EntityExtras} MonsterProps
 */

export class Monster extends Entity {
	/**
	 * Constructor for the Monster class.
	 * 
	 * @param {MonsterProps} p - Object that contains the properties to be set.
	 */
	constructor(p) {
		super(p)
		// monster specific props
		this.type = p?.type ?? ENTITY_TYPE.MONSTER
		this.speed = p?.speed ?? 400
		this.inCombat = false
		this.iddleStart = p?.iddleStart ?? 0
	}

	/**
	 * Find a monster by id.
	 * @param {Array<Monster>} mobs - Monster database.
	 * @param {number} id - Monster id.
	 * @returns {Monster|undefined} Monster if found, undefined otherwise.
	 */
	static findById(mobs, id) {
		return mobs.find(m => m.id === id)
	}
}