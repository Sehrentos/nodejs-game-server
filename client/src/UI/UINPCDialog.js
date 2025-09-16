import m from "mithril"
import DialogUI from "./DialogUI.js"
import { Events, State } from "../State.js"
import { sendDialog } from "../events/sendDialog.js"

/**
 * @typedef {Object} TUINPCDialogProps
 * @prop {string=} gid - The NPC's gid.
 * @prop {any=} content
 * @prop {boolean=} isVisible
 * @prop {boolean=} isBackdropVisible
 * @prop {boolean=} isBackdropClose
 */

/**
 * @class UINPCDialog
 * @description The NPC's Dialog UI component
 * @exports UINPCDialog
 */
export default class UINPCDialog extends DialogUI {
	/** @param {m.Vnode<TUINPCDialogProps>} vnode */
	constructor(vnode) {
		super(vnode)

		/** @type {string} - NPC's gid, what the player is interacting with */
		this.gid = ""

		this.currentArticle = 0

		this._onDOMDialogUpdate = this.onDOMDialogUpdate.bind(this)
	}

	// overrides DialogUI
	onClick(event) {
		/** @type {HTMLElement|null} - element where the event occurred */
		const target = event.target
		if (!target) {
			event.redraw = false
			return
		}

		/** @type {HTMLDivElement|null} - element where the event is attached to */
		const currentTarget = event.currentTarget
		if (!currentTarget) {
			event.redraw = false
			return
		}

		// the backdrop is clicked
		if (target.closest("div.ui-dialog-backdrop")) {
			this.close(currentTarget)
			return
		}

		// find the close button
		const closeButton = target.closest("button.close")
		if (closeButton) {
			this.close(currentTarget)
			return
		}

		// find the next button
		const nextButton = target.closest("button.next")
		if (nextButton) {
			this.showNextArticle(currentTarget)
			return
		}

		// find the accept button
		const acceptButton = target.closest("button.accept")
		if (acceptButton) {
			this.accept(currentTarget)
			return
		}

		// TODO other actions
		event.redraw = false
	}

	/**
	 * toggles the visibility of the next article element
	 * @param {HTMLDivElement} currentTarget
	 */
	showNextArticle(currentTarget) {
		const articles = currentTarget.querySelectorAll("article")
		if (this.currentArticle >= articles.length) {
			this.currentArticle = articles.length - 1
		} else {
			this.currentArticle++
		}

		for (let i = 0; i < articles.length; i++) {
			if (i === this.currentArticle) {
				articles[i].style.display = "block"
			} else {
				articles[i].style.display = "none"
			}
		}

		// send a "next" message to the server if it's open
		// this will tell server that the dialog is changing
		State.socket.send(sendDialog("next", this.gid, State.player.value.gid))
	}

	/**
	 * @param {HTMLDivElement} currentTarget
	 */
	close(currentTarget) {
		this.isVisible = false
		this.currentArticle = 0
		const articles = currentTarget.querySelectorAll("article")
		for (let i = 0; i < articles.length; i++) {
			articles[i].removeAttribute("style")
		}
		// send a "close" message to the server if it's open
		// this will tell server that the dialog is closed
		// and user can interact with other things or move
		State.socket.send(sendDialog("close", this.gid, State.player.value.gid))
	}

	/**
	 * @param {HTMLDivElement} currentTarget
	 */
	accept(currentTarget) {
		// hide the UI etc.
		this.close(currentTarget)

		// TODO only sell selected items from inventory (UI)

		// send a "accept" message to the server if it's open
		// this will tell server that the dialog is accepted and will be closed
		// and user can interact with other things or move
		State.socket.send(sendDialog("accept-sell-all", this.gid, State.player.value.gid))
	}

	oncreate(vnode) {
		Events.on("ui-npc-dialog", this._onDOMDialogUpdate)
	}

	onremove(vnode) {
		Events.off("ui-npc-dialog", this._onDOMDialogUpdate)
	}

	/**
	 * Updates the dialog content and displays the dialog UI.
	 *
	 * @param {TUINPCDialogProps} data - The custom event containing dialog content details.
	 */
	onDOMDialogUpdate(data) {
		this.gid = data.gid || ""
		this.content = data.content || ""
		this.isVisible = data.isVisible || false
		this.isBackdropVisible = data.isBackdropVisible || false
		this.isBackdropClose = data.isBackdropClose || false

		// send a "open" message to the server if it's open
		// this will tell server that the dialog is opened
		State.socket.send(sendDialog("open", this.gid, State.player.value.gid))

		m.redraw()
	}
}
