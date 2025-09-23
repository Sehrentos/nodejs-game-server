import { EQUIP_SLOT, ITEM_TYPE } from "../enum/Item.js";

/**
 * Database of items
 *
 * Note: the database is used to store the data of the items,
 * that will be instantiated with the `Item` class.
 *
 * @example const knife = new Item(ITEMS.KNIFE);
 */
//@type {{[key:string]: import("../models/Item.js").TItemProps}}
export const ITEMS = {
	DEFAULT: {
		id: 0,
		name: "Unknown",
		type: ITEM_TYPE.ETC
	},
	KNIFE: {
		id: 1,
		name: "Knife",
		type: ITEM_TYPE.WEAPON,
		slot: EQUIP_SLOT.WEAPON,
		sell: 100,
		buy: 150,
		atk: 25,
		atkMax: 75,
		aspd: 2.5,
		dropChange: 10,
	},
	SWORD: {
		id: 2,
		name: "Sword",
		type: ITEM_TYPE.WEAPON,
		slot: EQUIP_SLOT.WEAPON,
		sell: 500,
		buy: 750,
		atk: 110,
		atkMax: 150,
		aspd: 1.5,
		dropChange: 10,
	},
	BOW: {
		id: 3,
		name: "Bow",
		type: ITEM_TYPE.WEAPON,
		slot: EQUIP_SLOT.WEAPON,
		sell: 500,
		buy: 750,
		atk: 95,
		atkMax: 125,
		aspd: 1.0,
		dropChange: 10,
	},
	WAND: {
		id: 4,
		name: "Wand",
		type: ITEM_TYPE.WEAPON,
		slot: EQUIP_SLOT.WEAPON,
		sell: 100,
		buy: 150,
		atk: 15,
		atkMax: 20,
		mAtk: 35,
		mAtkMax: 95,
		aspd: 2.0,
		cspd: 2.5,
		dropChange: 10,
	},
	STAFF: {
		id: 5,
		name: "Staff",
		type: ITEM_TYPE.WEAPON,
		slot: EQUIP_SLOT.WEAPON,
		sell: 500,
		buy: 750,
		atk: 35,
		atkMax: 55,
		mAtk: 110,
		mAtkMax: 150,
		aspd: 1.0,
		cspd: 1.5,
		dropChange: 10,
	},
	SHIELD: {
		id: 6,
		name: "Shield",
		type: ITEM_TYPE.ARMOR,
		slot: EQUIP_SLOT.SHIELD,
		sell: 100,
		buy: 150,
		def: 20,
		dropChange: 10,
	},
	STONE: {
		id: 7,
		name: "Stone",
		type: ITEM_TYPE.ETC,
		sell: 5,
		buy: 7,
		dropChange: 90,
	},
	WOOD: {
		id: 8,
		name: "Wood",
		type: ITEM_TYPE.ETC,
		sell: 10,
		buy: 12,
		dropChange: 90,
	},
};

// const ITEM_KEYS = Object.keys(ITEMS)
const ITEM_VALUES = Object.values(ITEMS)

/**
 * Helper to get an item by its `id`
 * @param {number} id
 * @param {boolean} useFallback use `ITEMS.DEFAULT `as fallback
 * @returns
 */
export const getItemByItemId = (id, useFallback = true) => {
	const item = ITEM_VALUES.find(p => p.id === id)
	if (item === undefined && useFallback) return ITEMS.DEFAULT
	return item
}
