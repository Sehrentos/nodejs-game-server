/**
 * Creates a "player-leave" packet with the given player name.
 *
 * This is sent when socket is closed.
 *
 * @param {string} name - The name of the player leaving.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TPlayerLeavePacket - Player leave packet from the server
 * @prop {"player-leave"} type
 * @prop {string} name
 */
export function sendPlayerLeave(name) {
	return JSON.stringify({ type: "player-leave", name })
}
