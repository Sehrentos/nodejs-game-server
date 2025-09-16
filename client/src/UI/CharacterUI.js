import m from "mithril"
import "./CharacterUI.css"
import { Events, State } from "../State.js"
import TabsUI from "./TabsUI.js"
import AccordionUI from "./AccordionUI.js"
import { EXP_BASE, EXP_JOB } from "../../../shared/Constants.js"
import draggable from "../utils/draggable.js"

/**
 * @example m(CharacterUI, { isVisible: true })
 */
export default class CharacterUI {
	/**
	 * @param {m.Vnode} vnode
	 */
	constructor(vnode) {
		this.isVisible = vnode.attrs.isVisible !== false

		this._onKeydownListener = this.onKeydownListener.bind(this)
		// custom event to update player state on the UI
		this._onDOMPlayerUpdate = this.onDOMPlayerUpdate.bind(this)
		// TODO inventory updates from ui-inventory event
		// this._onDOMUpdateInventory = this.onDOMUpdateInventory.bind(this)
	}
	oncreate(vnode) {
		window.addEventListener("keydown", this._onKeydownListener)
		Events.on("ui-character", this._onDOMPlayerUpdate)
	}
	onremove(vnode) {
		window.removeEventListener("keydown", this._onKeydownListener)
		Events.off("ui-character", this._onDOMPlayerUpdate)
	}
	view() {
		return (this.isVisible && State.player.value)
			? m("div.ui-character",
				{ oncreate: (vnode) => draggable(vnode.dom) },
				m(AccordionUI, { isOpen: false },
					m("div",
						m("div.title", { title: `Press "C" to close` }, "Character"),
						m("div.info",
							m("div", `${State.player.value.name} (lv: ${State.player.value.level})`),
							m("div", `Hp: ${State.player.value.hp}/${State.player.value.hpMax}`),
							m("div", `Mp: ${State.player.value.mp}/${State.player.value.mpMax}`),
							m("div", `Base Exp: ${State.player.value.baseExp}/${State.player.value.level * EXP_BASE}`),
							m("div", `Job Exp: ${State.player.value.jobExp}/${State.player.value.level * EXP_JOB}`),
							m("div", `Money: ${State.player.value.money}`),
						),
					),
					m("div.overflow",
						m("div.equip",
							m("div", "Equip 1"),
							m("div", "Equip 2"),
							m("div", "Equip 3"),
							m("div", "Equip 4"),
							m("div", "Equip 5"),
							m("div", "Equip 6"),
							m("div", "Equip 7"),
							m("div", "Equip 8"),
							m("div", "Equip 9"),
						),
						m(TabsUI,
							m(".tab",
								m(".tablink.active", "Attack"),
								m(".tablink", "Defence"),
								m(".tablink", "Stats"),
								m(".tablink", "Network"),
							),
							m(".tabcontent.active", m(".stats",
								m("strong", "Attack"),
								m("span", State.player.value.atk || "1"),
								m("strong", "Attack multiplier"),
								m("span", State.player.value.atkMultiplier || "1"),
								m("strong", "Magic Attack"),
								m("span", State.player.value.mAtk || "1"),
								m("strong", "Magic multiplier"),
								m("span", State.player.value.mAtkMultiplier || "1"),
								m("strong", "Hit chance"),
								m("span", State.player.value.hit || "0"),
								m("strong", "Crit change"),
								m("span", State.player.value.crit || "0"),
							)),
							m(".tabcontent", m(".stats",
								m("strong", "Defence"),
								m("span", State.player.value.def || "0"),
								m("strong", "Defence multiplier"),
								m("span", State.player.value.defMultiplier || "1"),
								m("strong", "Magic defence"),
								m("span", State.player.value.mDef || "0"),
								m("strong", "Magic defence multiplier"),
								m("span", State.player.value.mDefMultiplier || "1"),
								m("strong", "Dodge chance"),
								m("span", State.player.value.dodge || "0"),
								m("strong", "Dodge multiplier"),
								m("span", State.player.value.dodgeMultiplier || "1"),
								m("strong", "Block change"),
								m("span", State.player.value.block || "0"),
								m("strong", "Block multiplier"),
								m("span", State.player.value.blockMultiplier || "1"),
							)),
							m(".tabcontent", m(".stats",
								m("strong", "Str"),
								m("span", State.player.value.str || "1"),
								m("strong", "Agi"),
								m("span", State.player.value.agi || "1"),
								m("strong", "Int"),
								m("span", State.player.value.int || "1"),
								m("strong", "Vit"),
								m("span", State.player.value.vit || "1"),
								m("strong", "Dex"),
								m("span", State.player.value.dex || "1"),
								m("strong", "Luk"),
								m("span", State.player.value.luk || "1"),
							)),
							m(".tabcontent", m(".stats",
								m("strong", "Latency"),
								m("span", `${State.player.value.latency || "0"} ms`),
							)),
						),
						// inventory
						m("details",
							m("summary", "Inventory"),
							m("div.equip", (State.player.value.inventory || []).map((item, index) =>
								m("div", { key: `${index}-${item.id}` }, `${index + 1}. ${item.name}`)
							))
						),
					)
				)
			)
			: undefined
	}
	onKeydownListener(event) {
		// pressing C will toggle the character UI
		// when no input is being focused
		if (event.code === "KeyC" && (event.target?.tagName ?? "") !== "INPUT") {
			this.isVisible = !this.isVisible
			m.redraw()
		}
	}

	/**
	 * handle the custom "ui-character" event to update the character UI.
	 * @param {any} data
	 */
	onDOMPlayerUpdate(data) {
		// /** @type {import("../../src/Packets.js").TEntity} */
		// const data = event.detail
		// apply incomming updates
		// see SocketControl.updatePlayer
		m.redraw()
	}
}
