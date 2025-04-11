/**
 * Creates a "rate-limit" packet. Used to get player latency.
 *
 * @param {string} message - The message to send.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TRateLimitPacket - Rate limit packet sent from the server
 * @prop {"rate-limit"} type
 * @prop {string} message
 */
export function sendRateLimit(message) {
	return JSON.stringify({ type: "rate-limit", message })
}
