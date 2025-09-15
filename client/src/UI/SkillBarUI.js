import m from "mithril"
import "./SkillBarUI.css"
import { State } from "../State.js"
import { sendSkill } from "../events/sendSkill.js"
import { SKILL_ID, SKILL_STATE } from "../../../shared/enum/Skill.js"
import { SKILL, STATE } from "../../../shared/data/SKILL.js"
import { draggable } from "../utils.js"

/**
 * @example m(SkillBarUI)
 */
export default class SkillBarUI {
	/**
	 * @param {m.Vnode} vnode
	 */
	constructor(vnode) {
		// custom event to update player state on the UI
		this._onDOMUpdate = this.onDOMUpdate.bind(this)
	}

	oncreate(vnode) {
		document.addEventListener("ui-skill-bar", this._onDOMUpdate)
	}

	onremove(vnode) {
		document.removeEventListener("ui-skill-bar", this._onDOMUpdate)
	}

	view() {
		return State.player
			? m("div.ui-skill-bar", {
				oncreate: (vnode) => draggable(vnode.dom),
			},
				[SKILL_ID.HEAL, SKILL_ID.STRIKE].map((id) => m("button", {
					id: `skill-id-${id}`,
					onclick: () => {
						State.socket.send(sendSkill(id))
						SkillBarUI.toggleSkillBarButton(id, "active")
					},
					title: SKILL[id].desc,
				}, SKILL[id].name)),
				/** Skill Tree button */
				m("button", {
					onclick: () => document.dispatchEvent(new CustomEvent("ui-skill-tree", {
						detail: { isVisible: true }
					}))
				}, "⁝⁝⁝"),
			)
			: undefined
	}
	// bind event listener to document element
	// to receive UI updates
	onDOMUpdate(event) {
		/** @type import("../../../server/src/events/sendSkillUse.js").TSkillUsePacket */
		const data = event.detail

		// const skill = SKILL[data.id] || SKILL[SKILL_ID.NONE];
		// const state = STATE[data.state] || STATE[SKILL_STATE.NONE];
		// console.log("[DEBUG] SkillBarUI:", skill, state)

		// toggle UI active class for the given skill id when success
		SkillBarUI.toggleSkillBarButton(data.id, data.state === SKILL_STATE.OK ? "active" : "error")
	}

	/**
	 * toggle the .active class for a short time on the skill button for the given id
	 * @param {number} id
	 * @param {"active"|"error"} type
	 */
	static toggleSkillBarButton(id, type) {
		const button = document.getElementById(`skill-id-${id}`)
		// remove previous active classes
		button.classList.remove("active", "error")
		button.classList.add(type)
		clearTimeout(SkillBarUI.toggleSkillBarButtonTimer)
		SkillBarUI.toggleSkillBarButtonTimer = setTimeout(() => button.classList.remove("active", "error"), 350)
	}
	static toggleSkillBarButtonTimer = null

	/**
	 * update the UI with optional data
	 * @param {import("../../../server/src/events/sendSkillUse.js").TSkillUsePacket} params - Skill use packet
	 */
	static emit(params) {
		return document.dispatchEvent(new CustomEvent("ui-skill-bar", { detail: params }));
	}
}
