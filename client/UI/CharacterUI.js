import m from "mithril"
import "./CharacterUI.css"
import { State } from "../State.js"
import TabsUI from "./TabsUI.js"

export default class CharacterUI {
	/**
	 * @param {m.Vnode} vnode 
	 */
	constructor(vnode) {
		this.isVisible = false

		this._onKeydownListener = this.onKeydownListener.bind(this)
		// custom event to update player state on the UI
		this._onDOMPlayerUpdate = this.onDOMPlayerUpdate.bind(this)
	}
	oncreate(vnode) {
		window.addEventListener("keydown", this._onKeydownListener)
		document.addEventListener("ui-character", this._onDOMPlayerUpdate)
	}
	onremove(vnode) {
		window.removeEventListener("keydown", this._onKeydownListener)
		document.removeEventListener("ui-character", this._onDOMPlayerUpdate)
	}
	view(vnode) {
		return (this.isVisible && State.player)
			? m("div.ui-character", [
				m("div.title", { title: `Press "C" to close` }, "Character"),
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
				m(TabsUI, {
					tabs: [
						{
							name: "Attack",
							active: true,
							content: m("div.stats", [
								m("strong", "Attack"),
								m("span", State.player.atk || "1"),
								m("strong", "Attack multiplier"),
								m("span", State.player.atkMultiplier || "1"),
								m("strong", "Magic Attack"),
								m("span", State.player.mAtk || "1"),
								m("strong", "Magic multiplier"),
								m("span", State.player.mAtkMultiplier || "1"),
								m("strong", "Hit chance"),
								m("span", State.player.hit || "1"),
								m("strong", "Crit change"),
								m("span", State.player.crit || "1"),
							]),
						},
						{
							name: "Defence",
							active: false,
							content: m("div.stats", [
								m("strong", "Defence"),
								m("span", State.player.def || "1"),
								m("strong", "Defence multiplier"),
								m("span", State.player.defMultiplier || "1"),
								m("strong", "Magic defence"),
								m("span", State.player.mDef || "1"),
								m("strong", "Magic defence multiplier"),
								m("span", State.player.mDefMultiplier || "1"),
								m("strong", "Dodge chance"),
								m("span", State.player.dodge || "1"),
								m("strong", "Dodge multiplier"),
								m("span", State.player.dodgeMultiplier || "1"),
								m("strong", "Flee"),
								m("span", State.player.flee || "1"),
							]),
						},
						{
							name: "Stats",
							active: false,
							content: m("div.stats", [
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
						},
					],
				}),
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
	onDOMPlayerUpdate(event) {
		// apply incomming updates
		State.player = { ...State.player, ...event.detail }
	}
}