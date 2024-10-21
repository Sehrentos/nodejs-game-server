/**
 * @typedef {Object} ItemProps
 * @prop {number=} id - Database id.
 * @prop {string=} name - Visual name.
 * @prop {number=} type - Item type. default ITEM_TYPE.ETC
 * @prop {number=} aspd - Attack speed. default 100
 * @prop {number=} cspd - Cast speed. default 100
 * @prop {number=} atk - Attack. default 1
 * @prop {number=} atkMax - Maximum attack. default 1
 * @prop {number=} mAtk - Magic attack. default 1
 * @prop {number=} mAtkMax - Maximum magic attack. default 1
 * @prop {number=} def - Defense (shield, armor). default 0
 * @prop {number=} mDef - Magic defense. default 0
 * @prop {number=} res - Resistance to elements. default 0
 * 
 */

import { ITEM_TYPE } from "../enum/Item.js"

export class Item {
	/**
	 * Constructor for the Item class.
	 * 
	 * @param {ItemProps} p - Object that contains the properties to be set.
	 */
	constructor(p) {
		this.id = p?.id ?? 0
		this.name = p?.name ?? ""
		this.type = p?.type ?? ITEM_TYPE.ETC
		this.aspd = p?.aspd ?? 1.0
		this.cspd = p?.cspd ?? 1.0
		this.atk = p?.atk ?? 1
		this.atkMax = p?.atkMax ?? 1
		this.mAtk = p?.mAtk ?? 1
		this.mAtkMax = p?.mAtkMax ?? 1
		this.def = p?.def ?? 0
		this.mDef = p?.mDef ?? 0
		this.res = p?.res ?? 0
	}

	/**
	 * Find a item by id.
	 * @param {Array<Item>} items - Item database.
	 * @param {number} id - Item id.
	 * @returns {Item|undefined} Item if found, undefined otherwise.
	 */
	static findById(items, id) {
		return items.find(i => i.id === id)
	}
}