import { ENTITY_TYPE } from "../enum/Entity.js";
import { NPCS } from "./NPCS.js";
/**
 * @typedef {Object} TMapData
 * @prop {number=} id - The id of the map.
 * @prop {string=} name - The name of the map.
 * @prop {number=} width - The width of the map.
 * @prop {number=} height - The height of the map.
 * @prop {boolean=} isLoaded - Whether the map is loaded.
 * @prop {Array<import("../model/Entity.js").TEntityProps|import("../model/Monster.js").TMonsterProps|import("../model/Portal.js").TPortalProps>=} entities - A list of entities.
 */
/**
 * Database of maps
 * 
 * Note: the database is used to store the data of the maps,
 * that will be instantiated with the `WorldMap` class.
 * 
 * @example const map = new WorldMap(MAPS[0]);
 * 
 * @type {TMapData[]}
 */
export const MAPS = [
	{
		id: 1,
		name: "Lobby town",
		width: 600,
		height: 400,
		isLoaded: true,
		entities: [
			{
				type: ENTITY_TYPE.WARP_PORTAL,
				x: 600 - 8,
				y: 400 / 2,
				portalTo: { id: 2, name: "Plain fields 1", x: 16, y: 800 / 2 },
			},
			{
				...NPCS[1], // Townsfolk
				x: 200,
				y: 250,
			},
			{
				...NPCS[2], // Blacksmith
				x: 269,
				y: 157,
			},
			{
				...NPCS[3], // Tool dealer
				x: 313,
				y: 160,
			},
			{
				...NPCS[4], // Merchant
				x: 216,
				y: 242,
			},
		]
	},
	{
		id: 2,
		name: "Plain fields 1",
		width: 1200,
		height: 800,
		isLoaded: true,
		entities: [
			{
				type: ENTITY_TYPE.WARP_PORTAL,
				x: 8,
				y: 800 / 2,
				portalTo: { id: 1, name: "Lobby town", x: 600 - 8 - 16, y: 400 / 2 },
			},
			{
				type: ENTITY_TYPE.WARP_PORTAL,
				x: 1200 - 8,
				y: 800 / 2,
				portalTo: { id: 3, name: "Plain fields 2", x: 16, y: 800 / 2 },
			},
			{ type: ENTITY_TYPE.MONSTER, id: 1, quantity: 50 }, // Bird
			{ type: ENTITY_TYPE.MONSTER, id: 2, quantity: 50 }, // Bug
		]
	},
	{
		id: 3,
		name: "Plain fields 2",
		width: 1200,
		height: 800,
		isLoaded: true,
		entities: [
			{
				type: ENTITY_TYPE.WARP_PORTAL,
				x: 8,
				y: 800 / 2,
				portalTo: { id: 2, name: "Plain fields 1", x: 1200 - 8 - 16, y: 800 / 2 },
			},
			{ type: ENTITY_TYPE.MONSTER, id: 3, quantity: 50 }, // Scorpion
			{ type: ENTITY_TYPE.MONSTER, id: 4, quantity: 50 }, // Snake
			{ type: ENTITY_TYPE.MONSTER, id: 5, quantity: 25 }, // Wolf
		]
	},
];