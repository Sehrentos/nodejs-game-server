/**
 * Database of monsters
 * 
 * Note: the database is used to store the data of the monsters,
 * that will be instantiated with the `Monster` class.
 * 
 * @example const bird = new Monster(MOBS[0]);
 * 
 * @type {Array<import("../model/Monster.js").TMonsterProps>}
 */
export const MOBS = [
	{
		id: 1,
		name: "Bird",
		hp: 25,
		hpMax: 25
	},
	{
		id: 2,
		name: "Bug",
		hp: 10,
		hpMax: 10
	},
	{
		id: 3,
		name: "Scorpion",
		hp: 100,
		hpMax: 100
	},
	{
		id: 4,
		name: "Snake",
		hp: 100,
		hpMax: 100
	},
	{
		id: 5,
		name: "Wolf",
		hp: 1000,
		hpMax: 1000
	},
];