import { ENTITY_TYPE } from "../enum/Entity.js";

/**
 * Database of NPCs
 * 
 * Note: the database is used to store the data of the NPCs,
 * that will be instantiated with the `Entity` class.
 * 
 * @example const npc1 = new Entity(NPCS[0]);
 * 
 * @type {Array<import("../model/NPC.js").TNPCProps>}
 */
export const NPCS = [
	{
		id: 0,
		type: ENTITY_TYPE.NPC,
		name: "NPC",
		dialog: [
			`Hey there! I'm the NPC!
			<button class="ui-dialog-close">X</button>`,
		],
	},
	{
		id: 1,
		type: ENTITY_TYPE.NPC,
		name: "Townsfolk",
		dialog: [
			`Hey there! I'm the Townsfolk!
			<button class="ui-dialog-close">X</button>`,
		],
	},
	{
		id: 2,
		type: ENTITY_TYPE.NPC,
		name: "Blacksmith",
		dialog: [
			`Hey there! I'm the Blacksmith!
			<button class="ui-dialog-close">X</button>`,
		],
	},
	{
		id: 3,
		type: ENTITY_TYPE.NPC,
		name: "Tool dealer",
		dialog: [
			`Hey there! I'm the Tool dealer!
			<button class="ui-dialog-close">X</button>`
		],
	},
	{
		id: 4,
		type: ENTITY_TYPE.NPC,
		name: "Merchant",
		dialog: [
			`Hey there! I'm the Merchant!
			<button class="ui-dialog-close">X</button>`
		],
	},
];