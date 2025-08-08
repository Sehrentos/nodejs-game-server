import { ENTITY_TYPE } from "../enum/Entity.js";

/**
 * Database of NPCs
 *
 * Note: the database is used to store the data of the NPCs,
 * that will be instantiated with the `Entity` class.
 *
 * @example const npc1 = new Entity(NPCS.DEFAULT);
 */
//@type {{[key:string]: import("../models/Entity.js").TEntityProps}}
export const NPCS = {
	DEFAULT: {
		id: 0,
		type: ENTITY_TYPE.NPC,
		name: "NPC",
		dialog: `<article>
			<header>NPC</header>
			<p>Hey there! I'm the NPC!</p>
			<button class="close">X</button>
		</article>`,
	},
	TOWNSFOLK: {
		id: 1,
		type: ENTITY_TYPE.NPC,
		name: "Townsfolk",
		dialog: `<article>
			<header>Townsfolk</header>
			<p>Hey there! I'm the Townsfolk!</p>
			<button class="close">X</button>
		</article>`,
	},
	BLACKSMITH: {
		id: 2,
		type: ENTITY_TYPE.NPC,
		name: "Blacksmith",
		dialog: `<article>
			<header>Blacksmith</header>
			<p>Hey there! I'm the Blacksmith!</p>
			<button class="close">X</button>
		</article>`,
	},
	TOOL_DEALER: {
		id: 3,
		type: ENTITY_TYPE.NPC,
		name: "Tool dealer",
		dialog: `<article>
			<header>Tool dealer</header>
			<p>Hey there! I'm the Tool dealer!</p>
			<p>You can sell all your items to me.</p>
			<button class="accept">Sell all</button>
			<button class="close">X</button>
		</article>`
	},
	MERCHANT: {
		id: 4,
		type: ENTITY_TYPE.NPC,
		name: "Merchant",
		dialog: `<article>
			<header>Merchant</header>
			<p>Hey there! I'm the Merchant!</p>
			<button class="close">X</button>
		</article>`,
	},
	STRANGER: {
		id: 5,
		type: ENTITY_TYPE.NPC,
		name: "Stranger",
		dialog: `<article>
			<header>Stranger (NPC)</header>
			<p>Hmmm...?</p>
			<button class="next">Next</button>
		</article>
		<article>
			<header>Stranger</header>
			<p>Hmmm... ...</p>
			<button class="next">Next</button>
		</article>
		<article>
			<header>Stranger</header>
			<p>Hmmm... ... ...</p>
			<button class="close">X</button>
		</article>`,
	},
};

/**
 * Helper to get an NPC by its `id`
 * @param {number} id
 * @param {boolean} useFallback use `NPCS.DEFAULT `as fallback
 * @returns
 */
export const getNPCById = (id, useFallback = true) => {
	const npc = Object.values(NPCS).find(p => p.id === id)
	if (npc === undefined && useFallback) return NPCS.DEFAULT
	return npc
}
