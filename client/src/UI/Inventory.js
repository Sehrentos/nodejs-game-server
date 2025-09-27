import "./Inventory.css"
import { tags } from "../utils/seui.js"
import Events from "../Events.js"

const { div, header, ul, li } = tags

/**
 * An `.ui-inventory` component
 *
 * Events:
 * - ui-inventory-toggle
 *
 * @param {import("../State.js").State} state
 */
export function Inventory(state) {
	return div(
		{
			class: "ui card ui-inventory",
			"data-draggable": "true",
			oncreate: (e) => {
				const ui = e.detail.ui
				// listen for the toggle event
				Events.on("toggle", (data) => {
					if (data.id !== "inventory") return
					ui.classList.toggle("open")
				})
			}
		},
		header("Inventory"),
		ul({
			oncreate: (e) => {
				const ui = e.detail.ui
				// subscribe to player changes for updates
				state.player.subscribe((player) => {
					if (player == null || player.inventory.length === 0) {
						ui.replaceChildren(li({ class: "no-items" }, "No items..."))
						return
					}
					ui.replaceChildren(...player.inventory.map(item => li(
						div({ class: "item-name" }, item.name),
						div({ class: "item-amount" }, `Amount: ${item.amount}`)
					)))
				}, true)
			}
		})
	)
}

export default Inventory
