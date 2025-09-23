import { ITEM_TYPE } from "../enum/Item.js"

/**
 * @typedef {Object} TItemProps
 * @prop {number=} _id - **DB row id** (if item was loaded from DB)
 * @prop {number=} _owner - **DB entity ID who owns the item** (if item was loaded from DB)
 * @prop {number=} id - Item id.
 * @prop {string=} name - Visual name of the item.
 * @prop {number=} type - Item type. default ITEM_TYPE.ETC
 * @prop {number=} amount - Amount. default 1
 * @prop {number=} slot - Equipment slot where it can be equipped. default 0
 * @prop {boolean=} isEquipped - Whether the item is currently equipped. default false
 * @prop {number=} dropChange - Drop chance 0-100 %. default 0
 * @prop {number=} buy - Buy price. default 0
 * @prop {number=} sell - Sell price. default 0
 * @prop {number=} aspd - Attack speed. default 0
 * @prop {number=} cspd - Cast speed. default 0
 * @prop {number=} atk - Attack. default 0
 * @prop {number=} atkMax - Maximum attack. default 0
 * @prop {number=} mAtk - Magic attack. default 0
 * @prop {number=} mAtkMax - Maximum magic attack. default 0
 * @prop {number=} def - Defense (shield, armor). default 0
 * @prop {number=} mDef - Magic defense. default 0
 * @prop {number=} res - Resistance to elements. default 0
 */

export class Item {
	/**
	 * Constructor for the Item class.
	 *
	 * @param {TItemProps} p - Object that contains the properties to be set.
	 */
	constructor(p) {
		/** @type {number} - DB row id (if item was loaded from DB) */
		this._id = p?._id ?? 0
		/** @type {number} - DB entity ID who owns the item (if item was loaded from DB) */
		this._owner = p?._owner ?? 0

		this.id = p?.id ?? 0
		this.name = p?.name ?? "Unknown"
		this.type = p?.type ?? ITEM_TYPE.ETC
		this.amount = p?.amount ?? 1
		/** @type {number} - Slot where it can be equipped */
		this.slot = p?.slot ?? 0
		/** @type {boolean} - Whether the item is currently equipped */
		this.isEquipped = p?.isEquipped ?? false
		this.dropChange = p?.dropChange ?? 0
		this.buy = p?.buy ?? 0
		this.sell = p?.sell ?? 0
		// this.aspd = p?.aspd ?? 0
		// this.cspd = p?.cspd ?? 0
		// this.atk = p?.atk ?? 0
		// this.atkMax = p?.atkMax ?? 0
		// this.mAtk = p?.mAtk ?? 0
		// this.mAtkMax = p?.mAtkMax ?? 0
		// this.def = p?.def ?? 0
		// this.mDef = p?.mDef ?? 0
		// this.res = p?.res ?? 0
	}
}
