/**
 * Items received from the server.
 *
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendItemsReceived.js").TItemsReceivedPacket} data - The player packet from the server.
 */
export function onItemsReceived(socket, data) {
	console.log("Received items:", data.items.map(p => `${p.name} x${p.amount}`));

	// update CharacterUI
	// Events.emit("ui-inventory", data.items);
}
