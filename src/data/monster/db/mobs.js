/**
 * Database of monsters
 * 
 * Note: the database is used to store the data of the monsters,
 * that will be instantiated with the `Monster` class.
 * 
 * @example const bird = new Monster(mobs.get(1));
 * 
 * @type {Map<number, import("../Monster.js").MonsterProps>}
 */
export const mobs = new Map([
	[1, {
		id: 1,
		name: "Bird",
		hp: 25,
		hpMax: 25
	}],
	[2, {
		id: 2,
		name: "Snake",
		hp: 100,
		hpMax: 100
	}],
	[3, {
		id: 3,
		name: "Scorpion",
		hp: 100,
		hpMax: 100
	}],
]);