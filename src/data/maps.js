import { ENTITY_TYPE } from "../enum/Entity.js";

/**
 * Database of maps
 * 
 * Note: the database is used to store the data of the maps,
 * that will be instantiated with the `WorldMap` class.
 * 
 * @example const map = new WorldMap({ name: 'lobby' });
 * 
 * @typedef {import("../model/Entity.js").EntityProps} TEntity
 * @typedef {import("../model/Monster.js").MonsterProps} TMonster
 * @typedef {import("../model/Portal.js").PortalProps} TPortal
 * @typedef {TEntity | TMonster | TPortal & TMapEntityExtras} TMapEntities
 * @typedef {Object} TMapEntityExtras
 * @prop {number=} quantity - Quantity of the entity. default undefined
 * 
 * @typedef {Object} TMapData
 * @prop {number=} id - The id of the map.
 * @prop {string=} name - The name of the map.
 * @prop {number=} width - The width of the map.
 * @prop {number=} height - The height of the map.
 * @prop {boolean=} isLoaded - Whether the map is loaded.
 * @prop {Array<TMapEntities>=} entities - A list of entities.
 * @type {TMapData[]}
 */
export const maps = [
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
			{ type: ENTITY_TYPE.MONSTER, id: 4, quantity: 50 }, // Bug
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
			{ type: ENTITY_TYPE.MONSTER, id: 2, quantity: 50 }, // Snake
			{ type: ENTITY_TYPE.MONSTER, id: 3, quantity: 50 }, // Scorpion
			{ type: ENTITY_TYPE.MONSTER, id: 5, quantity: 25 }, // Wolf
		]
	},
];