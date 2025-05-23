import { Entity } from "../../../shared/models/Entity.js";
import { Item } from "../../../shared/models/Item.js";
import { State } from "../State.js";

/**
 * Items received from the server.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendItemsReceived.js").TItemsReceivedPacket} data - The player packet from the server.
 */
export function onItemsReceived(socket, data) {
	console.log("Received items:", data.items);

	// check player state
	if (!(State.player instanceof Entity)) return;

	// merge items to player inventory
	const items = data.items.map(item => new Item(item));
	State.player.inventory = [...State.player.inventory, ...items];

	// update CharacterUI by dispatching a custom event
	document.dispatchEvent(new CustomEvent("ui-inventory", { detail: data.items }));

	// Note: next canvas render cycle will update the game view
}
