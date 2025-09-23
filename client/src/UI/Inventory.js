import "./Inventory.css"
import { tags } from "./index.js"
import state from "../State.js"
import Events from "../Events.js"

const { div, header, ul, li } = tags

//#region Observable subsriptions containers
// the contents of these containers will be updated
const inventoryList = ul(li("No items..."))
//#endregion

/**
 * An `.ui-inventory` component
 *
 * Events:
 * - ui-inventory-toggle
 */
export default function Inventory() {
	return div({ class: "ui card ui-inventory", "data-draggable": "true" },
		header("Inventory"),
		inventoryList
	)
}

// subscribe to player changes for updates, when player data changes
const unsubscribe = state.player.subscribe((player) => {
	if (player == null) return
	if (player.inventory.length === 0) {
		inventoryList.replaceChildren(li({ class: "no-items" }, "No items..."))
		return
	}
	inventoryList.replaceChildren(
		...player.inventory.map(item => {
			return li(
				div({ class: "item-name" }, item.name),
				div({ class: "item-amount" }, `Amount: ${item.amount}`)
			)
		})
	)
})

// listen for ui update events
Events.on("ui-inventory-toggle", onUiCharacterToggle)

/**
 * handle the custom event to toggle the UI.
 * @param {any} data
 */
function onUiCharacterToggle(data) {
	document.querySelector(".ui-inventory")?.classList?.toggle("open")
}

export { Inventory, unsubscribe }
