/**
 * Constructs a chat packet to send to the server.
 *
 * @param {string} channel - The chat channel.
 * @param {string} from - The username of the sender.
 * @param {string} to - The username of the recipient.
 * @param {string} message - The message content.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TChatPacket - Chat message structure from client
 * @prop {"chat"} type
 * @prop {string} channel
 * @prop {string} from
 * @prop {string} to
 * @prop {string} message
 */
export function sendChat(channel, from, to, message) {
	return JSON.stringify({
		type: "chat",
		channel,
		from,
		to,
		message
	})
}
