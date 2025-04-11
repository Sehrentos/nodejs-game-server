/**
 * Constructs a click packet to send to the server.
 *
 * @param {number} x - The x-coordinate of the click position.
 * @param {number} y - The y-coordinate of the click position.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TTouchPositionPacket - Click packet structure
 * @prop {"click"} type
 * @prop {number} x
 * @prop {number} y
 */
export function sendTouchPosition(x, y) {
	return JSON.stringify({ type: "click", x, y })
}
