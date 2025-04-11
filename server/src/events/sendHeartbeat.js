/**
 * Creates a heartbeat packet. Used to get player latency.
 *
 * @param {"ping"|"pong"|"heartbeat"} type - The type of the packet.
 * @param {number} timestamp - The timestamp of the packet.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} THeartbeatPacket - Ping/Pong packet sent from the server
 * @prop {"ping"|"pong"|"heartbeat"} type
 * @prop {number} timestamp
 */
export function sendHeartbeat(type, timestamp) {
	return JSON.stringify({ type, timestamp })
}
