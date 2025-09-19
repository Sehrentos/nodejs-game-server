import "./DialogNPC.css"
import { tags } from "./index.js"
import { State } from "../State.js"
import { sendDialog } from "../events/sendDialog.js"

const { div } = tags

/**
 * Dialog container element (draggable)
 */
const ui = div({ class: "ui card ui-dialog-npc centered", "data-draggable": "true" })

/** @type {string} - NPC's gid, what the player is interacting with */
let gid = ""

/** @type {number} - current article number (next page button) */
let currentArticle = 0

/**
 * An `.ui-dialog-npc` component
 */
export default function DialogNPC() {
	// bind user interaction listeners
	ui.removeEventListener("click", onclick, false)
	ui.addEventListener("click", onclick, false)

	// bind data listeners
	// State.events.emit("ui-dialog-npc-toggle");
	State.events.off("ui-dialog-npc-open", onDOMDialogUpdate)
	State.events.on("ui-dialog-npc-open", onDOMDialogUpdate)
	State.events.off("ui-dialog-npc-toggle", toggle)
	State.events.on("ui-dialog-npc-toggle", toggle)

	return ui
}

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

	// find the accept button
	if (target.closest("button.accept")) {
		accept()
		return
	}
}

/**
 * toggles the visibility of the next article element
 */
function showNextArticle() {
	if (!State.player.value || !State.socket) return
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
	State.socket.send(sendDialog("next", gid, State.player.value.gid))
}

/**
 * Close UI and send close ACT
 */
function close() {
	if (!State.player.value || !State.socket) return
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
	State.socket.send(sendDialog("close", gid, State.player.value.gid))
}

/**
 * Accept and send sell all ACT
 */
function accept() {
	if (!State.player.value || !State.socket) return
	close()

	// TODO only sell selected items from inventory (UI)

	// send a "accept" message to the server if it's open
	// this will tell server that the dialog is accepted and will be closed
	// and user can interact with other things or move
	State.socket.send(sendDialog("accept-sell-all", gid, State.player.value.gid))
}

/**
 * Updates the dialog content and displays the dialog UI.
 *
 * Note: Data is received from server.
 *
 * @param {import("../../../server/src/events/sendDialog.js").TDialogPacket} data - The dialog packet from the server.
 */
function onDOMDialogUpdate(data) {
	if (!State.player.value || !State.socket) return
	gid = data.gid || ""
	setContent(data.dialog || "")
	toggle(true)
	console.log("DialogNPC update event", data)

	// send a "open" message to the server if it's open
	// this will tell server that the dialog is opened
	State.socket.send(sendDialog("open", gid, State.player.value.gid))


}
