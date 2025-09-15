import m from "mithril"
import "./CharacterUI.css"
import { State } from "../State.js"
import TabsUI from "./TabsUI.js"
import AccordionUI from "./AccordionUI.js"
import { EXP_BASE, EXP_JOB } from "../../../shared/Constants.js"
import { draggable } from "../utils.js"

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
			? m("div.ui-character",
				{ oncreate: (vnode) => draggable(vnode.dom) },
				m(AccordionUI, { isOpen: false },
					m("div",
						m("div.title", { title: `Press "C" to close` }, "Character"),
						m("div.info",
							m("div", `${State.player.name} (lv: ${State.player.level})`),
							m("div", `Hp: ${State.player.hp}/${State.player.hpMax}`),
							m("div", `Mp: ${State.player.mp}/${State.player.mpMax}`),
							m("div", `Base Exp: ${State.player.baseExp}/${State.player.level * EXP_BASE}`),
							m("div", `Job Exp: ${State.player.jobExp}/${State.player.level * EXP_JOB}`),
							m("div", `Money: ${State.player.money}`),
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
								m("span", State.player.atk || "1"),
								m("strong", "Attack multiplier"),
								m("span", State.player.atkMultiplier || "1"),
								m("strong", "Magic Attack"),
								m("span", State.player.mAtk || "1"),
								m("strong", "Magic multiplier"),
								m("span", State.player.mAtkMultiplier || "1"),
								m("strong", "Hit chance"),
								m("span", State.player.hit || "0"),
								m("strong", "Crit change"),
								m("span", State.player.crit || "0"),
							)),
							m(".tabcontent", m(".stats",
								m("strong", "Defence"),
								m("span", State.player.def || "0"),
								m("strong", "Defence multiplier"),
								m("span", State.player.defMultiplier || "1"),
								m("strong", "Magic defence"),
								m("span", State.player.mDef || "0"),
								m("strong", "Magic defence multiplier"),
								m("span", State.player.mDefMultiplier || "1"),
								m("strong", "Dodge chance"),
								m("span", State.player.dodge || "0"),
								m("strong", "Dodge multiplier"),
								m("span", State.player.dodgeMultiplier || "1"),
								m("strong", "Block change"),
								m("span", State.player.block || "0"),
								m("strong", "Block multiplier"),
								m("span", State.player.blockMultiplier || "1"),
							)),
							m(".tabcontent", m(".stats",
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
							)),
							m(".tabcontent", m(".stats",
								m("strong", "Latency"),
								m("span", `${State.player.latency || "0"} ms`),
							)),
						),
						// inventory
						m("details",
							m("summary", "Inventory"),
							m("div.equip", (State.player.inventory || []).map((item, index) =>
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
	// bind event listener to document element
	// to receive player updates
	onDOMPlayerUpdate(event) {
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
		return document.dispatchEvent(new CustomEvent("ui-character", { detail: params }));
	}
}
