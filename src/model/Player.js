import { Entity } from "./Entity.js";
import { ENTITY_TYPE } from "../enum/Entity.js";
import { Party } from "./Party.js";

/**
 * @typedef {Object} EntityExtras
 * @prop {number=} type - Entity type. default ENTITY_TYPE.PLAYER
 * @prop {number=} attackStart - Timestamp in milliseconds when the player last attacked 
 * @prop {import("../control/EntityControl.js").TEntityControls=} attacking - Attacking entity
 * @prop {Party=} party - Party object.
 * @prop {Array<number>=} quests - Quest list.
 * @prop {Array<number>=} inventory - Inventory list.
 * @typedef {import("./Entity.js").EntityProps & EntityExtras} PlayerProps
 */

export class Player extends Entity {
	/**
	 * Constructor for the Player class.
	 * 
	 * @param {PlayerProps} p - Object that contains the properties to be set.
	 */
	constructor(p) {
		super(p)
		this.type = p?.type ?? ENTITY_TYPE.PLAYER
		this.hp = p?.hp ?? 100
		this.hpMax = p?.hpMax ?? 100
		this.mp = p?.mp ?? 50
		this.mpMax = p?.mpMax ?? 50
		this.speed = 100
		this.attackStart = 0
		this.attacking = null
		this.inventory = p?.inventory ?? []
		this.quests = p?.quests ?? []
		this.party = new Party(p?.party?.name, p?.party?.leader, p?.party?.members)
	}
}