/**
 * Creates a "packet" containing the state of a chat message
 * from the given user to the given recipient.
 *
 * @param {string} channel - The chat channel.
 * @param {string} from - The username of the sender.
 * @param {string} to - The username of the recipient.
 * @param {string} message - The message to send.
 * @param {number=} [timestamp] - The timestamp of the message.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TChatPacket - Chat message structure from server
 * @prop {"chat"} type
 * @prop {string} channel
 * @prop {string} from
 * @prop {string} to
 * @prop {string} message
 * @prop {number} timestamp Date.now()
 */
export function sendChat(channel, from, to, message, timestamp) {
	return JSON.stringify({
		type: "chat",
		timestamp: timestamp || Date.now(),
		channel: channel || "default", // default|private|log|...
		from: from,
		to: to,
		message: message
	})
}
