import { Entity } from "./Entity.js";
import { ENTITY_TYPE } from "../enum/Entity.js";
import { Party } from "./Party.js";

/**
 * @typedef {Object} EntityExtras
 * @prop {number=} type - Entity type. default ENTITY_TYPE.PLAYER
 * @prop {number=} portalUsed - Portal used timer. default 0
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
		this.portalUsed = 0
		this.speed = 100
		this.inventory = p?.inventory ?? []
		this.quests = p?.quests ?? []
		this.party = new Party(p?.party?.name, p?.party?.leader, p?.party?.members)
	}
}