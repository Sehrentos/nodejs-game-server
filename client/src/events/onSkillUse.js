import { SKILL_ID, SKILL_STATE } from "../../../shared/enum/Skill.js";
import { SKILL, STATE } from "../../../shared/data/SKILL.js";
import { Entity } from "../../../shared/models/Entity.js";
import { State } from "../State.js";

/**
 * Skill use received from the server.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendSkillUse.js").TSkillUsePacket} data - The packet from the server.
 */
export function onSkillUse(socket, data) {
	console.log("Received skill use (from server):", data);

	// check player state
	if (!(State.player.value instanceof Entity)) return;

	// parse readable message from the skill use packet
	const skill = SKILL[data.id] || SKILL[SKILL_ID.NONE];
	const state = STATE[data.state] || STATE[SKILL_STATE.NONE];
	const message = `Skill (${skill.name}) use ${state}!`;

	// send UI updates
	/** @type {import("../../../server/src/events/sendChat.js").TChatPacket} */
	const chatParams = {
		type: "chat",
		channel: "log",
		from: "server",
		to: State.player.value.name,
		message,
		timestamp: Date.now(),
	};
	// State.events.emit("ui-chat", chatParams);
	// update chat state
	State.chat.set((current) => ([...current, chatParams]))
	// update skill bar state
	State.events.emit("ui-skill-bar", data);
}
