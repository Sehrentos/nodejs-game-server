import "./SkillBar.css"
import { tags } from "../utils/seui.js"
import { sendSkill } from "../events/sendSkill.js"
import { SKILL_ID, SKILL_STATE } from "../../../shared/enum/Skill.js"
import { SKILL } from "../../../shared/data/SKILL.js"
import Events from "../Events.js"

const { div, button } = tags

// TODO get these from State.player.value.skills
const skillList = [SKILL_ID.HEAL, SKILL_ID.STRIKE, SKILL_ID.TAME]

/**
 * An `.ui-skill-bar` component
 *
 * @param {import("../State.js").State} state
 *
 * @returns {HTMLElement}
 */
export function SkillBar(state) {
	const ui = div({
		class: "ui card ui-skill-bar centered-x open",
		"data-draggable": "true"
	})

	/**
	 * toggle the .active class for a short time on the skill button for the given id
	 * @param {number} id
	 * @param {"active"|"error"} type
	 */
	function toggleSkillBar(id, type) {
		/** @type {HTMLButtonElement} */
		const btn = ui.querySelector(`button[data-skill-id="${id}"]`)
		if (!btn) return
		// remove previous active classes
		btn.classList.remove("active", "error")
		btn.classList.add(type)
		btn.disabled = true

		setTimeout(() => {
			btn.classList.remove("active", "error")
			btn.disabled = false
		}, 250)
	}

	// update skillbar data from player state
	const unsubscribe = state.player.subscribe((player) => {
		if (!player) { // No character data available
			ui.replaceChildren(
				button({ class: "skill-bar-button", }, "No skills"),
				button({ class: "open-skill-tree", }, "⁝⁝⁝")
			)
			return
		}
		ui.replaceChildren(...skillList.map((id) => button({
			class: "skill-bar-button",
			"data-skill-id": String(id),
			title: SKILL[id].desc, // optional
		}, SKILL[id].name)),
			/** open skill tree button */
			button({ class: "open-skill-tree", }, "⁝⁝⁝")
		)
		unsubscribe()
		// TODO update skillList with player skills?
		// TODO not need to refresh button each update,
		// but better approach could be implemented
	}, true)

	/**
	 * handles the custom "ui-skill-bar" event to update the skill bar UI.
	 * @param {import("../../../server/src/events/sendSkillUse.js").TSkillUsePacket} data
	 */
	function onSkillBarUpdate(data) {
		// const skill = SKILL[data.id] || SKILL[SKILL_ID.NONE];
		// const state = STATE[data.state] || STATE[SKILL_STATE.NONE];
		// console.log("[DEBUG] SkillBarUI:", skill, state)

		// toggle UI active class for the given skill id when success
		toggleSkillBar(data.id, data.state === SKILL_STATE.OK ? "active" : "error")
	}

	// add global event listeners
	Events.on("ui-skill-bar", onSkillBarUpdate)

	// bind ui events
	ui.addEventListener("click", event => {
		/** @type {HTMLElement} */
		// @ts-ignore
		const target = event.target
		if (target == null) return
		// open skill tree
		if (target.classList.contains("open-skill-tree")) {
			Events.emit("ui-skill-tree-toggle", {
				source: "skillbar"
			})
			return
		}
		// skill button
		if (target.classList.contains("skill-bar-button")) {
			const id = Number(target.dataset.skillId)
			if (!id) return
			state.socket?.send(sendSkill(id))
			toggleSkillBar(id, "active")
			return
		}
	})

	return ui
}

export default SkillBar
