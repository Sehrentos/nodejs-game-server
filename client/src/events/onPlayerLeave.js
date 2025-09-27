
// optional: do we actually need this packet?
/**
 * Handles player leave received from the server.
 *
 * Packet received when player leaves the game.
 *
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendPlayerLeave.js").TPlayerLeavePacket} data - The player data from the server.
 *
 *
 */
export function onPlayerLeave(socket, data) {
	console.log(`Player "${data.name}" left the game.`); // DEBUG
}
