import "./SkillTree.css"
import { tags } from "../utils/seui.js"
import { SKILL } from "../../../shared/data/SKILL.js"
import { SKILL_ID } from "../../../shared/enum/Skill.js"
import Events from "../Events.js"

const { div, span, header, button } = tags

/**
 * An `.ui-skill-tree` component
 *
 * @param {import("../State.js").State} state
 *
 * @returns {HTMLElement}
 */
export default function SkillTreeUI(state) {
	// create the skill tree UI
	const ui = div({ class: "ui card ui-skill-tree", "data-draggable": "true" },
		header(
			span("Skill Tree"),
			button({ class: "close" }, "X"),
		),
		div({ class: "content" })
	)

	/**
	 * update skill tree inner elements
	 */
	function update() {
		// map skill data to the ui
		ui.querySelector("div.content")?.replaceChildren(
			...Object.keys(SKILL).filter(id => id != SKILL_ID.NONE.toString())
				.map((key) => div({ class: "skill" },
					div({ class: "name" }, SKILL[key].name),
					div({ class: "desc" }, SKILL[key].desc),
					// div({class:"icon"}, SKILL[key].icon),
				))
		)
	}

	/**
	 * close the skill tree
	 * @param {MouseEvent} event
	 */
	function onClickClose(event) {
		//@ts-ignore
		if (event.target && event.target.closest("button.close")) {
			toggle(false)
		}
	}

	/**
	 * Toggle visibility
	 * @param {boolean} [visible] optional. set visibility with boolean or use toggle when undefined
	 */
	function toggle(visible) {
		switch (visible) {
			case true:
				ui.classList.add("open")
				break;
			case false:
				ui.classList.remove("open")
				break;
			default:
				ui.classList.toggle("open")
				break;
		}
	}

	/**
	 * handle the custom "ui-skill-tree" event to update the skill tree UI.
	 * @param {{source?: string}} data
	 */
	function onSkillTreeToggle(data) {
		toggle()
	}

	// bind user interaction listeners
	ui.addEventListener("click", onClickClose, false)

	// add global event listeners
	Events.on("ui-skill-tree-toggle", onSkillTreeToggle)

	// TODO get list of skills from player data
	// update skill tree data from state
	// const unsubscribe = state.player.subscribe((player) => {
	// 	if (!player) return
	// 	update()
	// 	unsubscribe()
	// })

	// initial
	update()

	return ui
}
