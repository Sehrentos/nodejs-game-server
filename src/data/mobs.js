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
		id: 0,
		name: "Worm",
		hp: 5,
		hpMax: 5,
		baseExp: 5,
		jobExp: 5,
		atk: 1,
	},
	{
		id: 1,
		name: "Bird",
		hp: 25,
		hpMax: 25,
		baseExp: 15,
		jobExp: 15,
		atk: 10,
	},
	{
		id: 2,
		name: "Bug",
		hp: 10,
		hpMax: 10,
		baseExp: 10,
		jobExp: 10,
		atk: 5,
	},
	{
		id: 3,
		name: "Scorpion",
		hp: 100,
		hpMax: 100,
		baseExp: 150,
		jobExp: 150,
		atk: 25,
	},
	{
		id: 4,
		name: "Snake",
		hp: 100,
		hpMax: 100,
		baseExp: 150,
		jobExp: 150,
		atk: 25,
	},
	{
		id: 5,
		name: "Wolf",
		hp: 1000,
		hpMax: 1000,
		baseExp: 1000,
		jobExp: 1000,
		atk: 60,
	},
];