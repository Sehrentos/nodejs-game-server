import m from "mithril"
import "./GameUI.css"
import CharacterUI from "./CharacterUI.js"
import ChatUI from "./ChatUI.js"
import CanvasUI from "./CanvasUI.js"
import { State } from "../State.js"
import UINPCDialog from "./UINPCDialog.js"
import SocketControl from "../control/SocketControl.js"

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
			m(CanvasUI),
			m(CharacterUI),
			m(ChatUI),
			m(UINPCDialog),
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