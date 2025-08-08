import { sendSkillUse } from "./sendSkillUse.js"

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

	if (entity.hp <= 0) return // must be alive

	// start using the skill
	if (ctrl.useSkill(data.id, timestamp)) {
		// send the skill use received packet back to the client as a response
		ctrl.socket.send(sendSkillUse(data.id))
		console.log(`[Event.onEntitySkill] id:${entity.id} "${entity.name}" use skill: "${data.id}"`);
	}
}
