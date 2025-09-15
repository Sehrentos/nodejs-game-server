import m from "mithril"
import "./GameUI.css"
import CharacterUI from "./CharacterUI.js"
import ChatUI from "./ChatUI.js"
import CanvasUI from "./CanvasUI.js"
import { State } from "../State.js"
import UINPCDialog from "./UINPCDialog.js"
import SocketControl from "../control/SocketControl.js"
import DialogUI from "./DialogUI.js"
import ExitGameUI from "./ExitGameUI.js"
import SkillBarUI from "./SkillBarUI.js"
import SkillTreeUI from "./SkillTreeUI.js"

/**
 * @class GameUI
 * @description Game UI for the game, contains the canvas, character and bindings etc.
 * @exports GameUI
 */
export default class GameUI {
	/**
	 * @param {m.Vnode} vnode
	 */
	constructor(vnode) {
		// disable text select in UI
		this._onDisableSelectStart = this.onDisableSelectStart.bind(this)
	}

	/**
	 * View method for the game UI.
	 *
	 * This method creates the game UI components, such as the canvas, character and chat.
	 *
	 * @returns {m.Vnode} The game UI vnode.
	 */
	view() {
		return m("main.ui-game",
			m(ExitGameUI, { isVisible: false }),
			m(ChatUI),
			m(CanvasUI),
			m(CharacterUI),
			m(UINPCDialog),
			m(SkillBarUI),
			m(SkillTreeUI),
			// show dialog to reconnect
			State.socket != null && State.socket.readyState === WebSocket.CLOSED ? m(DialogUI, {
				content: m("div",
					m("h1", "Connection closed"),
					m("p", "The web socket connection has been closed."),
					m("p", "Click the button below to log in again."),
					m("button", {
						type: "button",
						//class: "btn btn-primary",
						onclick: () => {
							// it's probably better to reload the page
							// clean up the state etc.
							window.location.reload()
							// navigate to login UI
							// window.location.href = "/#!/login"
						}
					}, "Go to login")
				),
				isVisible: true,
				isBackdropVisible: true,
				isBackdropClose: false
			}) : null,
		)
	}

	// #region Mithril events

	/**
	 * Called when the Mithril component is created.
	 *
	 * This adds the WebSocket connection and the events to the component.
	 *
	 * @param {import("mithril").VnodeDOM} vnode - The Mithril vnode.
	 */
	oncreate(vnode) {
		// close socket
		if (State.socket) {
			State.socket.remove()
		}

		// initialize the web socket
		State.socket = new SocketControl();

		// select event
		vnode.dom.addEventListener("selectstart", this._onDisableSelectStart)
	}

	/**
	 * Called when the Mithril component is removed.
	 *
	 * This removes the WebSocket connection and the events from the component.
	 */
	onremove(vnode) {
		if (State.socket) {
			State.socket.remove()
		}
		// select event
		vnode.dom.removeEventListener("selectstart", this._onDisableSelectStart)
	}

	// #endregion

	/**
	 * Disable text selection in the game UI.
	 *
	 * @param {Event} event - The selectstart event.
	 */
	onDisableSelectStart(event) {
		event.preventDefault()
	}
}
