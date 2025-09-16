import m from "mithril"
import "./SkillTreeUI.css"
import { Events, State } from "../State.js"
import { SKILL } from "../../../shared/data/SKILL.js"
import { SKILL_ID } from "../../../shared/enum/Skill.js"
import draggable from "../utils/draggable.js"

/**
 * @example m(SkillTreeUI, { isVisible: true })
 */
export default class SkillTreeUI {
	/**
	 * @param {m.Vnode<{isVisible: boolean}>} vnode
	 */
	constructor(vnode) {
		this.isVisible = vnode.attrs.isVisible === true
		this._onClose = this.onClose.bind(this)
		this._onDOMUpdate = this.onDOMUpdate.bind(this)
	}

	oncreate(vnode) {
		Events.on("ui-skill-tree", this._onDOMUpdate)
	}
	onremove(vnode) {
		Events.off("ui-skill-tree", this._onDOMUpdate)
	}

	view() {
		return this.isVisible
			? m("div.ui-skill-tree", {
				oncreate: (vnode) => draggable(vnode.dom),
			},
				m("div.header",
					m("span", "Skill Tree"),
					m("button", { onclick: this._onClose }, "X"),
				),
				m("div.content",
					/** map skill data to the ui */
					Object.keys(SKILL).filter(key => key != SKILL_ID.NONE.toString())
						.map((key) => m("div.skill", { key },
							m("div.name", SKILL[key].name),
							m("div.desc", SKILL[key].desc),
							// m("div.icon", SKILL[key].icon),
						))
				),
			)
			: undefined
	}

	onClose() {
		this.isVisible = false
	}
	/**
	 * handle the custom "ui-skill-tree" event to update the skill tree UI.
	 * @param {{isVisible: boolean}} data
	 */
	onDOMUpdate(data) {
		this.isVisible = data.isVisible
	}
}
