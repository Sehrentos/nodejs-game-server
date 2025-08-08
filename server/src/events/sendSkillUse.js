/**
 * Creates a skill use packet.
 *
 * @prop {number} id - The skill id (or keyboard shortcut)
 * @prop {string} from - The caster
 * @prop {string} target - The target
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TSkillUsePacket - Skill use packet sent from the server
 * @prop {"skill"} type
 * @prop {number} id
 * @prop {string} from
 * @prop {string} target
 */
export function sendSkillUse(id, from, target) {
	return JSON.stringify({ type: "skill", id, from, target })
}
