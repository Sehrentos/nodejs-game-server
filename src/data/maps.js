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
 * @typedef {import("../model/Player.js").PlayerProps} TPlayer
 * @typedef {import("../model/Portal.js").PortalProps} TPortal
 * @typedef {Object} TMapData
 * @prop {number=} id - The id of the map.
 * @prop {string=} name - The name of the map.
 * @prop {number=} width - The width of the map.
 * @prop {number=} height - The height of the map.
 * @prop {boolean=} isLoaded - Whether the map is loaded.
 * @prop {Array<TEntity|TMonster|TPlayer|TPortal>=} entities - A list of entities.
 * @type {TMapData[]}
 */
export const maps = [
	{
		id: 1,
		name: "lobby",
		width: 600,
		height: 400,
		isLoaded: true,
		entities: [
			{
				type: ENTITY_TYPE.WARP_PORTAL,
				x: 600 - 8,
				y: 8,
				portalTo: { id: 2, name: "Sold's Fin", x: 16, y: 16 },
			}
		]
	},
	{
		id: 2,
		name: "Sold's Fin",
		width: 4000,
		height: 2000,
		isLoaded: true,
		entities: [
			{
				type: ENTITY_TYPE.WARP_PORTAL,
				x: 8,
				y: 8,
				portalTo: { id: 1, name: "lobby", x: 592 - 16, y: 16 },
			}
		]
	},
];