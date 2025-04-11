/**
 * TODO (sketch) handle sending binary data instead JSON string
 *
 * @param {string} channel - The chat channel.
 * @param {string} from - The username of the sender.
 * @param {string} to - The username of the recipient.
 * @param {string} message - The message to send.
 * @param {number=} timestamp - The timestamp of the message.
 */
export const updateChatAsBuffer = (channel, from, to, message, timestamp) => {
	// create buffer for timestamp Number
	// Total size: 1 byte header + 8 bytes timestamp = 9 bytes
	const buf = Buffer.alloc(9)
	buf.writeUInt8(0x21, 0); // header 0x21 = 33
	buf.writeDoubleBE(timestamp || Date.now(), 1)

	return Buffer.concat([
		buf,
		Buffer.from(channel),
		Buffer.from(from),
		Buffer.from(to),
		Buffer.from(message)
	])
}
