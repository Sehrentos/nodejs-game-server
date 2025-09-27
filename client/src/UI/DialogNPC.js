import "./DialogNPC.css"
import { tags } from "../utils/seui.js"
import { sendDialog } from "../events/sendDialog.js"
import Events from "../Events.js"

const { div, li } = tags

/**
 * An `.ui-dialog-npc` component
 *
 * @param {import("../State.js").State} state
 *
 * @returns {HTMLElement}
 */
export default function DialogNPC(state) {
	// create the dialog UI
	const ui = div({ class: "ui card ui-dialog-npc centered", "data-draggable": "true" })

	/** @type {string} - NPC's gid, what the player is interacting with */
	let gid = ""

	/** @type {number} - current article number (next page button) */
	let currentArticle = 0

	/**
	 * Toggle dialog visibility
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

	function setContent(value) {
		if (typeof value === "string") {
			ui.innerHTML = value
			return;
		}
		ui.replaceChildren(value)
	}

	/** @param {MouseEvent|TouchEvent} event  */
	function onclick(event) {
		/** @type {HTMLElement|null} - element where the event occurred */
		//@ts-ignore
		const target = event.target
		if (!target) return

		// /** @type {HTMLDivElement|null} - element where the event is attached to */
		// //@ts-ignore
		// const currentTarget = event.currentTarget
		// if (!currentTarget) return

		// find the close button
		if (target.closest("button.close")) {
			close()
			return
		}

		// find the next button
		if (target.closest("button.next")) {
			showNextArticle()
			return
		}

		// find the accept-sell-all button
		if (target.closest("button.accept-sell-all")) {
			acceptSellAll()
			return
		}

		// find the sell button
		if (target.closest("button.sell")) {
			onSellButtonClick()
			return
		}
	}

	/**
	 * toggles the visibility of the next article element
	 */
	function showNextArticle() {
		if (!state.player.value || !state.socket) return
		const articles = ui.querySelectorAll("article")
		if (currentArticle >= articles.length) {
			currentArticle = articles.length - 1
		} else {
			currentArticle++
		}

		for (let i = 0; i < articles.length; i++) {
			if (i === currentArticle) {
				articles[i].style.display = "block"
			} else {
				articles[i].style.display = "none"
			}
		}

		// send a "next" message to the server if it's open
		// this will tell server that the dialog is changing
		state.socket.send(sendDialog("next", gid, state.player.value.gid))

		// Shop UI check existence of button.sell-list-items
		// if exists, populate it with sellable items from inventory
		const listItems = articles[currentArticle].querySelector("ul.sell-list-items")
		if (listItems != null) {
			//@ts-ignore
			updateSellListItems(listItems)
		}
	}

	/**
	 * populate article UI with sellable items from entity.inventory
	 *
	 * @param {HTMLUListElement} listElement - the ul.sell-list-items element to populate
	 */
	function updateSellListItems(listElement) {
		const player = state.player.value

		// clear existing items
		// listElement.innerHTML = ""

		// get all sellable items
		const items = player.inventory.filter(item => {
			// only sell items that have a sell price
			if (item.sell <= 0) return false
			// only sell unequipped items
			if (item.isEquipped) return false
			return true
		})

		if (items.length === 0) {
			listElement.innerHTML = "<li>No items to sell</li>"
			return
		}

		// sort by name
		listElement.replaceChildren(...items.map(item =>
			li(`${item.name} (x${item.amount}) - Sell: ${item.sell}z`, {
				/** click to select items to sell */
				onclick: (e) => {
					/** @type {HTMLLIElement|null} */
					//@ts-ignore
					const listItem = e.target.closest("li")
					if (listItem == null) return
					/** @type {HTMLSpanElement|null} */
					const currentSelectedAmount = listItem.querySelector(".selected-item-amount")
					if (currentSelectedAmount) {
						let selectedAmount = parseInt(currentSelectedAmount.dataset.selectedItemAmount || "0", 10)
						if (selectedAmount >= item.amount) return
						selectedAmount++
						currentSelectedAmount.dataset.selectedItemId = item.id.toString()
						currentSelectedAmount.dataset.selectedItemAmount = selectedAmount.toString()
						currentSelectedAmount.textContent = `Sell amount: ${selectedAmount}`
					}
				},
				/** right click to cancel selection */
				oncontextmenu: onDecreaseSelectedItemAmount,
				// ondblclick: onDecreaseSelectedItemAmount,
			}, div({ class: "selected-item-amount" }, "Sell amount: 0"))
		))
	}

	/**
	 * Handler for decreasing the selected item amount on right-click or double-click.
	 * @param {Event} e
	 */
	function onDecreaseSelectedItemAmount(e) {
		e.preventDefault()
		/** @type {HTMLLIElement|null} */
		//@ts-ignore
		const listItem = e.target.closest("li")
		if (listItem == null) return
		/** @type {HTMLSpanElement|null} */
		const currentSelectedAmount = listItem.querySelector(".selected-item-amount")
		if (currentSelectedAmount) {
			let selectedAmount = parseInt(currentSelectedAmount.dataset.selectedItemAmount || "0", 10)
			if (selectedAmount) {
				selectedAmount--
				currentSelectedAmount.dataset.selectedItemAmount = selectedAmount.toString()
				currentSelectedAmount.textContent = `Sell amount: ${selectedAmount}`
			}
		}
	}

	/**
	 * Handler for the sell button click event.
	 * Get selected items and their amounts from the UI
	 * and send the sell request to the server.
	 */
	function onSellButtonClick() {
		const articles = ui.querySelectorAll("article")
		if (currentArticle >= articles.length) return
		const listItems = articles[currentArticle].querySelectorAll("ul.sell-list-items li")
		if (listItems.length === 0) return

		/** @type {{id: number, amount: number}[]} - selected items and their amounts */
		const selectedItems = []
		for (const _li of listItems) {
			/** @type {HTMLSpanElement|null} */
			const currentSelectedAmount = _li.querySelector(".selected-item-amount")
			if (currentSelectedAmount) {
				const selectedItemId = parseInt(currentSelectedAmount.dataset.selectedItemId, 10)
				const selectedItemAmount = parseInt(currentSelectedAmount.dataset.selectedItemAmount || "0", 10)
				if (selectedItemAmount > 0) {
					selectedItems.push({ id: selectedItemId, amount: selectedItemAmount })
				}
			}
		}

		// send a "sell" message to the server if it's open
		// this will tell server that the dialog is accepted and will be closed
		// and user can interact with other things or move
		state.socket.send(sendDialog("sell", gid, state.player.value.gid, {
			sellItems: selectedItems
		}))

		close()
	}

	/**
	 * Close UI and send close ACT
	 */
	function close() {
		if (!state.player.value || !state.socket) return
		toggle()
		currentArticle = 0
		ui.innerHTML = ""
		// const articles = currentTarget.querySelectorAll("article")
		// for (let i = 0; i < articles.length; i++) {
		// 	articles[i].removeAttribute("style")
		// }

		// send a "close" message to the server if it's open
		// this will tell server that the dialog is closed
		// and user can interact with other things or move
		state.socket.send(sendDialog("close", gid, state.player.value.gid))
	}

	/**
	 * Accept and send sell all ACT
	 */
	function acceptSellAll() {
		if (!state.player.value || !state.socket) return
		close()

		// send a "accept" message to the server if it's open
		// this will tell server that the dialog is accepted and will be closed
		// and user can interact with other things or move
		state.socket.send(sendDialog("accept-sell-all", gid, state.player.value.gid))
	}

	/**
	 * Updates the dialog content and displays the dialog UI.
	 *
	 * Note: Data is received from server.
	 *
	 * @param {import("../../../server/src/events/sendDialog.js").TDialogPacket} data - The dialog packet from the server.
	 */
	function onDOMDialogUpdate(data) {
		if (!state.player.value || !state.socket) return
		gid = data.gid || ""
		setContent(data.dialog || "")
		toggle(true)
		console.log("DialogNPC update event", data)

		// send a "open" message to the server if it's open
		// this will tell server that the dialog is opened
		state.socket.send(sendDialog("open", gid, state.player.value.gid))
	}

	// bind user interaction listeners
	ui.removeEventListener("click", onclick, false)
	ui.addEventListener("click", onclick, false)

	// add global event listeners
	// Events.emit("ui-dialog-npc-toggle");
	Events.on("ui-dialog-npc-open", onDOMDialogUpdate)
	Events.on("ui-dialog-npc-toggle", toggle)

	return ui
}
