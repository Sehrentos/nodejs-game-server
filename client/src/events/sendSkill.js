/**
 * Constructs a skill use packet to send to the server.
 *
 * @param {number} id - The skill id (or keyboard shortcut)
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TSkillPacket - Chat message structure from client
 * @prop {"skill"} type
 * @prop {number} id
 */
export function sendSkill(id) {
	return JSON.stringify({
		type: "skill",
		id
	})
}
