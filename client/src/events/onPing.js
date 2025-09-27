import { sendHeartbeat } from "./sendHeartbeat.js";

/**
 * Handles the "ping" packet received from the server.
 *
 * Responds with a "pong" packet, which is used for latency measurement.
 *
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendHeartbeat.js").THeartbeatPacket} data - The heartbeat packet from server.
 */
export function onPing(socket, data) {
	socket.send(sendHeartbeat("pong", data.timestamp));
}
