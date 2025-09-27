import { SKILL_ID, SKILL_STATE } from "../../../shared/enum/Skill.js";
import { SKILL, STATE } from "../../../shared/data/SKILL.js";
import { Entity } from "../../../shared/models/Entity.js";
import Events from "../Events.js";

/**
 * Skill use received from the server.
 *
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendSkillUse.js").TSkillUsePacket} data - The packet from the server.
 */
export function onSkillUse(socket, data) {
	const state = socket.state
	console.log("Received skill use (from server):", data);

	// check player state
	if (!(state.player.value instanceof Entity)) return;

	// parse readable message from the skill use packet
	const skill = SKILL[data.id] || SKILL[SKILL_ID.NONE];
	const _state = STATE[data.state] || STATE[SKILL_STATE.NONE];
	const message = `Skill (${skill.name}) use ${_state}!`;

	// send UI updates
	/** @type {import("../../../server/src/events/sendChat.js").TChatPacket} */
	const chatParams = {
		type: "chat",
		channel: "log",
		from: "server",
		to: state.player.value.name,
		message,
		timestamp: Date.now(),
	};
	// Events.emit("ui-chat", chatParams);
	// update chat state
	state.chat.set((current) => ([...current, chatParams]))
	// update skill bar state
	Events.emit("ui-skill-bar", data);
}
