/**
 * Handles "rate-limit" received from the server.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendRateLimit.js").TRateLimitPacket} data - The rate-limit packet from the server.
 */
export function onRateLimit(socket, data) {
	console.log(`[${data.type}]: ${data.message}`); // DEBUG
}
