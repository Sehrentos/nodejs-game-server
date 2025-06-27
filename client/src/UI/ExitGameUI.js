import m from "mithril"
import "./ExitGameUI.css"
import { State } from "../State.js"
import { sendLogout } from "../events/sendLogout.js"

/**
 * @example m(ExitGameUI, { isVisible: true })
 */
export default class ExitGameUI {
	/**
	 * @param {m.Vnode<{isVisible: boolean}>} vnode
	 */
	constructor(vnode) {
		this.isVisible = vnode.attrs.isVisible !== false

		this._onClose = this.onClose.bind(this)
		this._onExit = this.onExit.bind(this)
		this._onLogout = this.onLogout.bind(this)
		this._onKeydownListener = this.onKeydownListener.bind(this)
	}

	oncreate(vnode) {
		window.addEventListener("keydown", this._onKeydownListener)
	}

	onremove(vnode) {
		window.removeEventListener("keydown", this._onKeydownListener)
	}

	view(vnode) {
		return this.isVisible
			? m("div.ui-exit-game.ontop",
				m("div.title", "Exit Game"),
				m("div.actions",
					m("button", { onclick: this._onExit }, "Exit"),
					m("button", { onclick: this._onLogout }, "Exit and logout"),
					m("button", { onclick: this._onClose }, "Cancel"),
				),
			)
			: undefined
	}

	onClose() {
		this.isVisible = false
	}

	onExit() {
		State.socket.remove();
		window.location.href = "/";
	}

	onLogout() {
		// send logout packet that will remove the JWT token in server
		State.socket.send(sendLogout());
		// TODO await response from server before leave or trust it to handle the logout process?
		State.socket.remove();
		// clear token
		localStorage.removeItem("token");
		window.location.href = "/";
	}

	onKeydownListener(event) {
		// pressing C will toggle the character UI
		// when no input is being focused
		if (event.code === "Escape" && (event.target?.tagName ?? "") !== "INPUT") {
			this.isVisible = !this.isVisible
			m.redraw()
		}
	}

}
