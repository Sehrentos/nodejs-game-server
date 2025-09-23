// import { Entity } from "../../../shared/models/Entity.js";
// import { Item } from "../../../shared/models/Item.js";

/**
 * Items received from the server.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendItemsReceived.js").TItemsReceivedPacket} data - The player packet from the server.
 */
export function onItemsReceived(socket, data) {
	console.log("Received items:", data.items.map(p => `${p.name} x${p.amount}`));

	// check player state
	// if (!(State.player.value instanceof Entity)) return;

	// merge items to player inventory
	// const items = data.items.map(item => new Item(item));
	// State.player.set((player) => {
	// 	// if (player == null) return player;
	// 	for (const item of items) {
	// 		// check if item already exists and update its amount
	// 		let existingItem = player.inventory.find(itm => itm.id === item.id);
	// 		if (existingItem) {
	// 			existingItem.amount += item.amount;
	// 			continue;
	// 		}
	// 		// item doesn't exist, add it
	// 		player.inventory.push(item);
	// 	}
	// 	return player;
	// });

	// update CharacterUI
	// State.events.emit("ui-inventory", data.items);

	// Note: next canvas render cycle will update the game view
}
