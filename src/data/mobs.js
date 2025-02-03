import { ENTITY_TYPE } from "../enum/Entity.js";

/**
 * Database of monsters
 * 
 * Note: the database is used to store the data of the monsters,
 * that will be instantiated with the `Monster` class.
 * 
 * @example const bird = new Monster(MOBS[0]);
 * 
 * @type {Array<import("../model/Entity.js").TEntityProps>}
 */
export const MOBS = [
	{
		id: 0,
		type: ENTITY_TYPE.MONSTER,
		name: "Worm",
		hp: 5,
		hpMax: 5,
		baseExp: 5,
		jobExp: 5,
		atk: 1,
		aspd: 1000,
	},
	{
		id: 1,
		type: ENTITY_TYPE.MONSTER,
		name: "Bird",
		hp: 25,
		hpMax: 25,
		baseExp: 15,
		jobExp: 15,
		atk: 10,
		aspd: 1000,
	},
	{
		id: 2,
		type: ENTITY_TYPE.MONSTER,
		name: "Bug",
		hp: 10,
		hpMax: 10,
		baseExp: 10,
		jobExp: 10,
		atk: 5,
		aspd: 1000,
	},
	{
		id: 3,
		type: ENTITY_TYPE.MONSTER,
		name: "Scorpion",
		hp: 100,
		hpMax: 100,
		baseExp: 150,
		jobExp: 150,
		atk: 25,
		aspd: 1000,
	},
	{
		id: 4,
		type: ENTITY_TYPE.MONSTER,
		name: "Snake",
		hp: 100,
		hpMax: 100,
		baseExp: 150,
		jobExp: 150,
		atk: 25,
		aspd: 1000,
	},
	{
		id: 5,
		type: ENTITY_TYPE.MONSTER,
		name: "Wolf",
		hp: 1000,
		hpMax: 1000,
		baseExp: 1000,
		jobExp: 1000,
		atk: 60,
		aspd: 1000,
	},
];