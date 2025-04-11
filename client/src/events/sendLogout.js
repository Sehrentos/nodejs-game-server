/**
 * Constructs a "logout" packet to be sent by the client.
 * This packet is used to notify the server of a logout event.
 *
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TPlayerLogoutPacket - Player logout packet
 * @prop {"logout"} type
 */
export function sendLogout() {
	return JSON.stringify({ type: "logout" })
}
