import "./Character.css"
import { tags } from "../utils/seui.js"
import { Tabs, TabLinks, TabLink, TabContent } from "./Tabs.js"
import AccordionUI from "./Accordion.js"
import { EXP_BASE, EXP_JOB } from "../../../shared/Constants.js"
import Events from "../Events.js"

const { div, header, strong, span } = tags

/**
 * An `.ui-character` component
 *
 * @param {import("../State.js").State} state
 *
 * @returns {HTMLElement}
 */
export function Character(state) {
	//#region Observable updates
	const headerName = header("Character")
	const headerDetails = div({ class: "info" })
	const equipmentGrid = div({ class: "equip" })

	const tabAttack = TabContent({ active: true })
	const tabDefence = TabContent()
	const tabStats = TabContent()
	const tabNetwork = TabContent()
	//#endregion

	// subscribe to player changes for updates
	state.player.subscribe((player) => {
		if (player == null) {
			headerName.textContent = "No character"
			return
		}

		// character name
		headerName.textContent = `${player.name} (lv: ${player.level})`

		// basic info
		headerDetails.replaceChildren(
			// div(`${player.name} (lv: ${player.level})`),
			div(`Hp: ${player.hp}/${player.hpMax}`),
			div(`Mp: ${player.mp}/${player.mpMax}`),
			div(`Base Exp: ${player.baseExp}/${player.level * EXP_BASE}`),
			div(`Job Exp: ${player.jobExp}/${player.level * EXP_JOB}`),
			div(`Money: ${player.money}`),
		)

		// equip slots
		equipmentGrid.replaceChildren(
			div("Equip 1"),
			div("Equip 2"),
			div("Equip 3"),
			div("Equip 4"),
			div("Equip 5"),
			div("Equip 6"),
			div("Equip 7"),
			div("Equip 8"),
			div("Equip 9"),
		)

		// update tab attack
		tabAttack.replaceChildren(div({ class: "stats" },
			strong("Attack"),
			span(player.atk || "1"),
			strong("Attack multiplier"),
			span(player.atkMultiplier || "1"),
			strong("Magic Attack"),
			span(player.mAtk || "1"),
			strong("Magic multiplier"),
			span(player.mAtkMultiplier || "1"),
			strong("Hit chance"),
			span(player.hit || "0"),
			strong("Crit change"),
			span(player.crit || "0"),
		))

		// update tab defence
		tabDefence.replaceChildren(div({ class: "stats" },
			strong("Defence"),
			span(player.def || "0"),
			strong("Defence multiplier"),
			span(player.defMultiplier || "1"),
			strong("Magic defence"),
			span(player.mDef || "0"),
			strong("Magic defence multiplier"),
			span(player.mDefMultiplier || "1"),
			strong("Dodge chance"),
			span(player.dodge || "0"),
			strong("Dodge multiplier"),
			span(player.dodgeMultiplier || "1"),
			strong("Block change"),
			span(player.block || "0"),
			strong("Block multiplier"),
			span(player.blockMultiplier || "1"),
		))

		// update tab stats
		tabStats.replaceChildren(div({ class: "stats" },
			strong("Str"),
			span(player.str || "1"),
			strong("Agi"),
			span(player.agi || "1"),
			strong("Int"),
			span(player.int || "1"),
			strong("Vit"),
			span(player.vit || "1"),
			strong("Dex"),
			span(player.dex || "1"),
			strong("Luk"),
			span(player.luk || "1"),
		))

		// update tab network
		tabNetwork.replaceChildren(div({ class: "stats" },
			strong("Latency"),
			span(`${player.latency || "0"} ms`),
		))
	}, true)

	return div({
		class: "ui card ui-character open",
		"data-draggable": "true",
		oncreate: (e) => {
			const ui = e.detail.ui
			// listen for the toggle event
			Events.on("toggle", (data) => {
				if (data.id !== "character") return
				ui.classList.toggle("open")
			})
		}
	},
		AccordionUI({ id: "character", isOpen: false },
			div(
				headerName,
				headerDetails,
			),
			div({ class: "overflow" },
				equipmentGrid,
				Tabs(
					TabLinks(
						TabLink({ active: true }, "Attack"),
						TabLink({ active: false }, "Defence"),
						TabLink({ active: false }, "Stats"),
						TabLink({ active: false }, "Network"),
					),
					tabAttack,
					tabDefence,
					tabStats,
					tabNetwork
				)
			)
		)
	)
}

export default Character
