/**
 * Creates a heartbeat packet with the current timestamp.
 *
 * This function serializes a JSON object containing a "heartbeat" type
 * and the provided timestamp, which can be used for latency measurement
 * or connection health monitoring.
 *
 * @param {string} type - The type of the heartbeat packet. Defaults to "heartbeat".
 * @param {number} timestamp - The current timestamp for the heartbeat packet.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} THeartbeatPacket - Ping/Pong packet sent from the server/client
 * @prop {"ping"|"pong"|"heartbeat"} type
 * @prop {number} timestamp
 */
export function sendHeartbeat(type = "heartbeat", timestamp) {
	return JSON.stringify({ type, timestamp })
}
