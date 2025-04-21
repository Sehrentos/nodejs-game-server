import { ITEM_TYPE } from "../enum/Item.js";

/**
 * Database of items
 *
 * Note: the database is used to store the data of the items,
 * that will be instantiated with the `Item` class.
 *
 * @example const knife = new Item(ITEMS[0]);
 *
 * @type {Array<import("../models/Item.js").TItemProps>}
 */
export const ITEMS = [
	{
		itemId: 0,
		name: "Unknown",
		type: ITEM_TYPE.ETC
	},
	{
		itemId: 1,
		name: "Knife",
		type: ITEM_TYPE.WEAPON,
		sell: 100,
		buy: 150,
		atk: 25,
		atkMax: 75,
		aspd: 2.5,
		dropChange: 10,
	},
	{
		itemId: 2,
		name: "Sword",
		type: ITEM_TYPE.WEAPON,
		sell: 500,
		buy: 750,
		atk: 110,
		atkMax: 150,
		aspd: 1.5,
		dropChange: 10,
	},
	{
		itemId: 3,
		name: "Bow",
		type: ITEM_TYPE.WEAPON,
		sell: 500,
		buy: 750,
		atk: 95,
		atkMax: 125,
		aspd: 1.0,
		dropChange: 10,
	},
	{
		itemId: 4,
		name: "Wand",
		type: ITEM_TYPE.WEAPON,
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
	{
		itemId: 5,
		name: "Staff",
		type: ITEM_TYPE.WEAPON,
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
	{
		itemId: 6,
		name: "Stone",
		type: ITEM_TYPE.ETC,
		sell: 5,
		buy: 7,
		dropChange: 90,
	},
	{
		itemId: 7,
		name: "Wood",
		type: ITEM_TYPE.ETC,
		sell: 10,
		buy: 12,
		dropChange: 90,
	},
];
