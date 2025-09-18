import "./SkillBar.css"
import { tags } from "./index.js"
import { State } from "../State.js"
import { sendSkill } from "../events/sendSkill.js"
import { SKILL_ID, SKILL_STATE } from "../../../shared/enum/Skill.js"
import { SKILL, STATE } from "../../../shared/data/SKILL.js"

const { div, button } = tags

/**
 * Container `.ui-skill-bar` element (draggable)
 */
const ui = div({ class: "ui card ui-skill-bar centered-x open", "data-draggable": "true" })

// TODO get these from State.player.value.skills
const skillList = [SKILL_ID.HEAL, SKILL_ID.STRIKE, SKILL_ID.TAME]

let toggleSkillBarButtonTimer = null

/**
 * An `.ui-skill-bar` component
 */
export default function SkillBarUI() {
	State.events.off("ui-skill-bar", onDOMUpdate)
	State.events.on("ui-skill-bar", onDOMUpdate)

	// update skillbar data from player state
	const unsubscribe = State.player.subscribe((player) => {
		if (!player) return
		update()
		unsubscribe()
		// TODO update skillList with player skills?
		// TODO not need to refresh button each update,
		// but better approach could be implemented
	})

	// initial
	update()

	return ui
}

/**
 * update skill bar inner elements
 */
function update() {
	ui.replaceChildren(...skillList.map((id) => button({
		id: `skill-id-${id}`,
		onclick: () => {
			State.socket.send(sendSkill(id))
			toggleSkillBarButton(id, "active")
		},
		title: SKILL[id].desc,
	}, SKILL[id].name)),
		/** open skill tree button */
		button({
			onclick: () => State.events.emit("ui-skill-tree-toggle", {
				source: "skillbar"
			})
		}, "⁝⁝⁝")
	)
}

/**
 * handles the custom "ui-skill-bar" event to update the skill bar UI.
 * @param {import("../../../server/src/events/sendSkillUse.js").TSkillUsePacket} data
 */
function onDOMUpdate(data) {
	// const skill = SKILL[data.id] || SKILL[SKILL_ID.NONE];
	// const state = STATE[data.state] || STATE[SKILL_STATE.NONE];
	// console.log("[DEBUG] SkillBarUI:", skill, state)

	// toggle UI active class for the given skill id when success
	toggleSkillBarButton(data.id, data.state === SKILL_STATE.OK ? "active" : "error")
}

/**
 * toggle the .active class for a short time on the skill button for the given id
 * @param {number} id
 * @param {"active"|"error"} type
 */
function toggleSkillBarButton(id, type) {
	const btn = document.getElementById(`skill-id-${id}`)
	// remove previous active classes
	btn.classList.remove("active", "error")
	btn.classList.add(type)

	clearTimeout(toggleSkillBarButtonTimer)
	toggleSkillBarButtonTimer = setTimeout(() => {
		btn.classList.remove("active", "error")
	}, 350)
}
