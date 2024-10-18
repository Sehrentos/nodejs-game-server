import { Entity } from "../Entity.js";
import { ENTITY_TYPE } from "../enum/Entity.js";

/**
 * @typedef {Object} EntityExtras
 * @prop {number=} type - Entity type. default ENTITY_TYPE.MONSTER
 * @prop {number=} speed - Speed. default 400
 * @prop {number=} iddleStart - Iddle start time. default 0
 * @typedef {import("../Entity.js").EntityProps & EntityExtras} MonsterProps
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
		this.iddleStart = p?.iddleStart ?? 0
	}

	/**
	 * Find a monster by id.
	 * @param {Map<number, Monster>} mobs - Monster database.
	 * @param {number} id - Monster id.
	 * @returns {Monster|undefined} Monster if found, undefined otherwise.
	 */
	static findById(mobs, id) {
		return mobs.get(id)
	}
}