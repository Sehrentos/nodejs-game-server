import m from "mithril"
import "./ExitGameUI.css"
import { State } from "../State.js"

/**
 * @example m(ExitGameUI, { isVisible: true })
 */
export default class ExitGameUI {
	/**
	 * @param {m.Vnode<{isVisible: boolean}>} vnode 
	 */
	constructor(vnode) {
		this.isVisible = vnode.attrs.isVisible !== false

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
					m("button", {
						onclick: () => {
							/** @type {import("../../src/Packets.js").TPlayerLogoutPacket} */
							const pkt = { type: "logout" };
							State.socket.send(JSON.stringify(pkt));
							// TODO await response from server before leave or trust it to handle the logout process?
							State.socket.remove();
							localStorage.removeItem("token");
							window.location.href = "/";
						}
					}, "Exit and logout"),
					m("button", { onclick: () => { this.isVisible = false; } }, "Cancel"),
				),
			)
			: undefined
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