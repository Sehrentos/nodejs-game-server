import { Entity } from "../../../shared/models/Entity.js";
import { State } from "../State.js";

/**
 * Skill use received from the server.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendSkillUse.js").TSkillUsePacket} data - The packet from the server.
 */
export function onSkillUse(socket, data) {
	console.log("Received skill use (from server):", data);

	// check player state
	if (!(State.player instanceof Entity)) return;

	// merge items to player inventory
	// const items = data.items.map(item => new Item(item));
	// State.player.inventory = [...State.player.inventory, ...items];

	// // update CharacterUI by dispatching a custom event
	// document.dispatchEvent(new CustomEvent("ui-inventory", { detail: data.items }));

	// Note: next canvas render cycle will update the game view
}
