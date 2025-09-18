import "./Character.css"
import { tags } from "./index.js"
import { State } from "../State.js"
import { Tabs, TabLinks, TabLink, TabContent } from "./Tabs.js"
import AccordionUI from "./Accordion.js"
import { EXP_BASE, EXP_JOB } from "../../../shared/Constants.js"

const { div, header, details, summary, strong, span } = tags

//#region Observable subsriptions containers
// the contents of these containers will be updated
const headerName = header("Character")
const headerDetails = div({ class: "info" })
const equipmentGrid = div({ class: "equip" })

const tabAttack = TabContent({ active: true })
const tabDefence = TabContent()
const tabStats = TabContent()
const tabNetwork = TabContent()

const inventoryList = div({ class: "equip" })
//#endregion

/**
 * An `.ui-character` component
 */
export default function Character() {
	return div({ class: "ui card ui-character open", "data-draggable": "true" },
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
				),
				details(
					summary("Inventory"),
					inventoryList,
				)
			)
		)
	)
}

// subscribe to player changes for updates, when player data changes
const unsubscribe = State.player.subscribe((player) => {
	if (player == null) return

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

	// update inventory
	inventoryList.replaceChildren(...(player.inventory || []).map((item, index) =>
		div({ key: `${index}-${item.id}` }, `${index + 1}. ${item.name}`)
	))
})

// listen for ui update events
State.events.on("ui-character-toggle", onUiCharacterToggle)

/**
 * handle the custom "ui-character" event to toggle the character UI.
 * @param {any} data
 */
function onUiCharacterToggle(data) {
	// console.log("[DEBUG] CharacterUI: onUiCharacterToggle", data)
	document.querySelector(".ui-character")?.classList?.toggle("open")
}

export { Character, unsubscribe }
