import { ENTITY_TYPE } from "../enum/Entity.js";
import { ITEMS } from "./ITEMS.js";

/**
 * Database of monsters
 *
 * Note: the database is used to store the data of the monsters,
 * that will be instantiated with the `Monster` class.
 *
 * @example const bird = new Monster(MOBS[0]);
 *
 * @type {Array<import("../models/Entity.js").TEntityProps>}
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
		atk: 1
	},
	{
		id: 1,
		type: ENTITY_TYPE.MONSTER,
		name: "Cat",
		hp: 25,
		hpMax: 25,
		baseExp: 15,
		jobExp: 15,
		atk: 10,
		aspd: 1000,
		range: 20,
		inventory: [
			ITEMS[6], // Stone
			ITEMS[7], // Wood
		],
	},
	{
		id: 2,
		type: ENTITY_TYPE.MONSTER,
		name: "Orc",
		hp: 35,
		hpMax: 35,
		baseExp: 30,
		jobExp: 30,
		atk: 15,
		aspd: 1000,
		range: 12,
		inventory: [
			ITEMS[1], // Knife
			ITEMS[6], // Stone
			ITEMS[7], // Wood
		],
	},
	{
		id: 3,
		type: ENTITY_TYPE.MONSTER,
		name: "Plankton",
		hp: 500,
		hpMax: 500,
		baseExp: 200,
		jobExp: 200,
		atk: 25,
		aspd: 1000,
		range: 18,
	},
	{
		id: 4,
		type: ENTITY_TYPE.MONSTER,
		name: "Orc with gloves?",
		hp: 500,
		hpMax: 500,
		baseExp: 200,
		jobExp: 200,
		atk: 25,
		aspd: 1000,
		range: 18,
		inventory: [
			ITEMS[1], // Knife
			ITEMS[2], // Sword
			ITEMS[6], // Stone
			ITEMS[7], // Wood
		],
	},
	{
		id: 5,
		type: ENTITY_TYPE.MONSTER,
		name: "The eye",
		hp: 1000,
		hpMax: 1000,
		baseExp: 800,
		jobExp: 800,
		atk: 60,
		aspd: 1000,
		range: 18,
	},
	{
		id: 6,
		type: ENTITY_TYPE.MONSTER,
		name: "Ladybug",
		hp: 1000,
		hpMax: 1000,
		baseExp: 800,
		jobExp: 800,
		atk: 60,
		aspd: 1000,
		range: 18,
	},
	{
		id: 7,
		type: ENTITY_TYPE.MONSTER,
		name: "Skeleton",
		hp: 5000,
		hpMax: 5000,
		baseExp: 10000,
		jobExp: 10000,
		atk: 160,
		aspd: 1000,
		range: 32,
		w: 60,
		h: 120,
	},
	{
		id: 8,
		type: ENTITY_TYPE.MONSTER,
		name: "Dinosaur",
		hp: 100,
		hpMax: 100,
		baseExp: 50,
		jobExp: 50,
		atk: 30,
		aspd: 1000,
		range: 18,
		inventory: [
			ITEMS[6], // Stone
			ITEMS[7], // Wood
		],
	},
	{
		id: 9,
		type: ENTITY_TYPE.MONSTER,
		name: "Mushroom",
		hp: 90,
		hpMax: 90,
		baseExp: 40,
		jobExp: 40,
		atk: 15,
		aspd: 1000,
		range: 18,
		inventory: [
			ITEMS[6], // Stone
			ITEMS[7], // Wood
		],
	},
	{
		id: 10,
		type: ENTITY_TYPE.MONSTER,
		name: "Wind spirit",
		hp: 150,
		hpMax: 150,
		baseExp: 80,
		jobExp: 80,
		atk: 35,
		aspd: 1000,
		range: 18,
	},
	{
		id: 11,
		type: ENTITY_TYPE.MONSTER,
		name: "Slushie",
		hp: 150,
		hpMax: 150,
		baseExp: 80,
		jobExp: 80,
		atk: 35,
		aspd: 1000,
		range: 18,
		inventory: [
			ITEMS[6], // Stone
			ITEMS[7], // Wood
		],
	},
	{
		id: 12,
		type: ENTITY_TYPE.MONSTER,
		name: "Red mushroom",
		hp: 150,
		hpMax: 150,
		baseExp: 80,
		jobExp: 80,
		atk: 35,
		aspd: 1000,
		range: 18,
		inventory: [
			ITEMS[6], // Stone
			ITEMS[7], // Wood
		],
	},
	{
		id: 13,
		type: ENTITY_TYPE.MONSTER,
		name: "Ladybug 2",
		hp: 150,
		hpMax: 150,
		baseExp: 80,
		jobExp: 80,
		atk: 35,
		aspd: 1000,
		range: 18,
	},
	{
		id: 14,
		type: ENTITY_TYPE.MONSTER,
		name: "Robot 1",
		hp: 150,
		hpMax: 150,
		baseExp: 80,
		jobExp: 80,
		atk: 35,
		aspd: 1000,
		range: 18,
	},
	{
		id: 15,
		type: ENTITY_TYPE.MONSTER,
		name: "Unicorn",
		hp: 1500,
		hpMax: 1500,
		baseExp: 800,
		jobExp: 800,
		atk: 100,
		aspd: 1000,
		range: 18,
	},
	{
		id: 16,
		type: ENTITY_TYPE.MONSTER,
		name: "Ghost",
		hp: 1500,
		hpMax: 1500,
		baseExp: 800,
		jobExp: 800,
		atk: 100,
		aspd: 1000,
		range: 18,
	},
];
