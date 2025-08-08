import m from "mithril"
import "./SkillBarUI.css"
import { State } from "../State.js"
import { sendSkill } from "../events/sendSkill.js"

/**
 * @example m(SkillBarUI)
 */
export default class SkillBarUI {
	/**
	 * @param {m.Vnode} vnode
	 */
	constructor(vnode) {
		// custom event to update player state on the UI
		this._onDOMUpdate = this.onDOMUpdate.bind(this)
	}
	oncreate(vnode) {
		document.addEventListener("ui-skill-bar", this._onDOMUpdate)
	}
	onremove(vnode) {
		document.removeEventListener("ui-skill-bar", this._onDOMUpdate)
	}
	view(vnode) {
		return State.player
			? m("div.ui-skill-bar",
				m("button", { onclick: () => State.socket.send(sendSkill(1)) }, "Heal"),
				m("button", { onclick: () => State.socket.send(sendSkill(2)) }, "Strike"),
			)
			: undefined
	}
	// bind event listener to document element
	// to receive player updates
	onDOMUpdate(event) {
		// /** @type {import("../../src/Packets.js").TEntity} */
		// const data = event.detail
		// apply incomming updates
		// see SocketControl.updatePlayer
		m.redraw()
	}

	/**
	 * update the character UI with optional data
	 * @param {import("../../../shared/models/Entity").TEntityProps} params - The player data from the server.
	 */
	static emit(params) {
		return document.dispatchEvent(new CustomEvent("ui-skill-bar", { detail: params }));
	}
}
