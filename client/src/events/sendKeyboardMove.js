
/**
 * Converts a keyboard event's key code into a packet to send to the server,
 * indicating the player's movement.
 *
 * @param {string} keyCode - The key code from the keyboard event.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TKeyboardMovePacket - Keyboard move packet
 * @prop {"move"} type
 * @prop {string} code
 */
export function sendKeyboardMove(keyCode) {
	return JSON.stringify({ type: "move", code: keyCode })
}
