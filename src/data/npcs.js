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
			`<article>
				<header>NPC</header>
				<p>Hey there! I'm the NPC!</p>
				<button class="ui-dialog-close">X</button>
			</article>`,
		],
	},
	{
		id: 1,
		type: ENTITY_TYPE.NPC,
		name: "Townsfolk",
		dialog: [
			`<article>
				<header>Townsfolk</header>
				<p>Hey there! I'm the Townsfolk!</p>
				<button class="ui-dialog-close">X</button>
			</article>`,
		],
	},
	{
		id: 2,
		type: ENTITY_TYPE.NPC,
		name: "Blacksmith",
		dialog: [
			`<article>
				<header>Blacksmith</header>
				<p>Hey there! I'm the Blacksmith!</p>
				<button class="ui-dialog-close">X</button>
			</article>`,
		],
	},
	{
		id: 3,
		type: ENTITY_TYPE.NPC,
		name: "Tool dealer",
		dialog: [
			`<article>
				<header>Tool dealer</header>
				<p>Hey there! I'm the Tool dealer!</p>
				<button class="ui-dialog-close">X</button>
			</article>`
		],
	},
	{
		id: 4,
		type: ENTITY_TYPE.NPC,
		name: "Merchant",
		dialog: [
			`<article>
				<header>Merchant</header>
				<p>Hey there! I'm the Merchant!</p>
				<button class="ui-dialog-close">X</button>
			</article>`
		],
	},
];