import { SKILL_ID, SKILL_STATE } from "../../../shared/enum/Skill.js";
import { sendSkillUse } from "./sendSkillUse.js";

/**
 * Handles the "skill" packet sent by the client.
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 * @param {import("../../../client/src/events/sendSkill.js").TSkillPacket} data
 * @param {number} timestamp
 */
export default function onEntitySkill(entity, data, timestamp) {
	const ctrl = entity.control

	// check if data is valid
	if (data == null || data.type !== 'skill' && typeof data.id !== "number") {
		return
	}

	// map skill id to skill function
	switch (data.id) {
		case SKILL_ID.HEAL: // Heal HP skill 20%, 10s cooldown
			ctrl.skillControl.heal(timestamp)
			break
		case SKILL_ID.STRIKE: // Attack skill 2x more damage as normal, 5s cooldown
			ctrl.skillControl.strike(timestamp)
			break
		default:
			// send ACK (acknowledge) skill use packet back to the client as a response
			ctrl.socket.send(sendSkillUse(data.id, null, null, SKILL_STATE.NONE))
			break
	}

	// console.log(`[Event.onEntitySkill] id:${entity.id} "${entity.name}" use skill: "${data.id}"`);
}
