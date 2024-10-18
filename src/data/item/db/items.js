/**
 * Database of items
 * 
 * Note: the database is used to store the data of the items,
 * that will be instantiated with the `Item` class.
 * 
 * @example const knife = new Item(items.get(1));
 * 
 * @type {Map<number, import("../Item.js").ItemProps>}
 */
export const items = new Map([
	[1, {
		id: 1,
		name: "Knife",
		atk: 25,
		atkMax: 75,
		aspd: 2.5,
	}],
	[2, {
		id: 2,
		name: "Sword",
		atk: 110,
		atkMax: 150,
		aspd: 1.5,
	}],
	[3, {
		id: 3,
		name: "Bow",
		atk: 95,
		atkMax: 125,
		aspd: 1.0,
	}],
	[4, {
		id: 4,
		name: "Wand",
		atk: 15,
		atkMax: 20,
		mAtk: 35,
		mAtkMax: 95,
		aspd: 2.0,
		cspd: 2.5,
	}],
	[5, {
		id: 5,
		name: "Staff",
		atk: 35,
		atkMax: 55,
		mAtk: 110,
		mAtkMax: 150,
		aspd: 1.0,
		cspd: 1.5,
	}],
]);