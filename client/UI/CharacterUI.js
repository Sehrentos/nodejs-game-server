import m from "mithril"
import { State } from "../State.js"

export default class CharacterUI {
	/**
	 * @param {m.Vnode} vnode 
	 */
	constructor(vnode) {
		this.isVisible = true

		this._onKeydownListener = this.onKeydownListener.bind(this)
		// custom event to update player state on the UI
		// this._onDOMPlayerUpdate = this.onDOMPlayerUpdate.bind(this)
	}
	oncreate(vnode) {
		window.addEventListener("keydown", this._onKeydownListener)
		// document.addEventListener("player", this._onDOMPlayerUpdate)
	}
	onremove(vnode) {
		window.removeEventListener("keydown", this._onKeydownListener)
		// document.removeEventListener("player", this._onDOMPlayerUpdate)
	}
	view(vnode) {
		return (this.isVisible && State.player)
			? m("div.ui-character", { title: "Toggle with Key 'C'." }, [
				m("div.title", "Character"),
				m("div.equip", [
					m("div", "Equip 1"),
					m("div", "Equip 2"),
					m("div", "Equip 3"),
					m("div", "Equip 4"),
					m("div", "Equip 5"),
					m("div", "Equip 6"),
					m("div", "Equip 7"),
					m("div", "Equip 8"),
					m("div", "Equip 9"),
				]),
				m("div.stats", [
					m("strong", "Str"),
					m("span", State.player.str || "1"),
					m("strong", "Agi"),
					m("span", State.player.agi || "1"),
					m("strong", "Int"),
					m("span", State.player.int || "1"),
					m("strong", "Vit"),
					m("span", State.player.vit || "1"),
					m("strong", "Dex"),
					m("span", State.player.dex || "1"),
					m("strong", "Luk"),
					m("span", State.player.luk || "1"),
				]),
			])
			: undefined
	}
	onKeydownListener(event) {
		const tag = event.target?.tagName ?? ""
		if (event.code === "KeyC" && tag !== "INPUT") {
			this.isVisible = !this.isVisible
			m.redraw()
		}
	}
	// bind event listener to document element
	// to receive player updates
	// onDOMPlayerUpdate(event) {
	// 	// apply incomming updates
	// 	State.player = { ...State.player, ...event.detail }
	// }
}