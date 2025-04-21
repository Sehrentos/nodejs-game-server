/**
 * Creates a items received packet.
 *
 * @param {import("../../../shared/models/Item.js").Item[]} items - The items.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TItemsReceivedPacket - Items received packet sent from the server
 * @prop {"items-received"} type
 * @prop {import("../../../shared/models/Item.js").TItemProps[]} items
 */
export function sendItemsReceived(items) {
	return JSON.stringify({ type: "items-received", items })
}
