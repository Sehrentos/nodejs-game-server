/**
 * Creates a items sold packet.
 *
 * @prop {number} money - Total sell price
 * @prop {number} amount - Total sell amount
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TItemsReceivedPacket - Items received packet sent from the server
 * @prop {"items-sold"} type
 * @prop {number} money - Total sell price
 * @prop {number} amount - Total sell amount
 */
export function sendItemsSold(money, amount) {
	return JSON.stringify({ type: "items-sold", money, amount })
}
