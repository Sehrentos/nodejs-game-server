// import Events from "../Events.js"
import Observable from "../utils/Observable.js"
/**
 * @typedef {Object} UIComponentProps
 * @prop {string} name
 * @prop {import("../State.js").State} state
 * @prop {boolean=} isCard
 * @prop {boolean=} isVisible
 * @prop {boolean=} isDraggable
 */

/**
 * Create a UI Component with base structure and functionality
 *
 * @param {UIComponentProps} props
 * @param {...string|HTMLElement} children
 *
 * @returns {UIComponent}
 */
export class UIComponent {
	/**
	 *
	 * @param {UIComponentProps} props
	 * @param  {...string|HTMLElement} children
	 */
	constructor(props, ...children) {
		this.name = props?.name || "UIComponent"

		/** @type {HTMLElement} */
		this.element = document.createElement("div")
		this.element.className = `ui ui-${this.name}`

		/** @type {null|import("../State.js").State} state */
		this.state = props?.state || null

		if (props?.isCard) this.card(true)
		if (props?.isDraggable) this.draggable(true)
		// if (props?.isToggable) this.toggable(true)

		this.visible = new Observable(props?.isVisible === true)
		this.visible.subscribe((visible) => {
			if (visible) this.element.classList.add("open")
			else this.element.classList.remove("open")
		}, true)

		this.element.append(...children)
	}

	/** @returns {HTMLElement} */
	render() {
		return this.element
	}

	/** @returns {void} */
	show() {
		// this.element.classList.add("open")
		this.visible.set(true)
	}

	/** @returns {void} */
	hide() {
		// this.element.classList.remove("open")
		this.visible.set(false)
	}

	/**
	 * @returns {void}
	 */
	toggle() {
		// this.element.classList.toggle("open")
		this.visible.set(!this.visible.value)
	}

	// /**
	//  * @param {boolean} value
	//  * @returns {void}
	//  */
	// toggable(value) {
	// 	Events.off(`ui-${this.name}-toggle`, this._onToggle)
	// 	if (!value) return
	// 	this._onToggle = () => this.toggle()
	// 	Events.on(`ui-${this.name}-toggle`, this._onToggle)
	// }

	/**
	 * @param {boolean} value
	 * @returns {void}
	 */
	draggable(value) {
		this.element.setAttribute("data-draggable", value ? "true" : "false")
	}

	/**
	 * @param {boolean} value
	 * @returns {void}
	 */
	card(value) {
		if (value) this.element.classList.add("card")
		else this.element.classList.remove("card")
	}
}

export default UIComponent;

// example use case:
// import "./Inventory.css"
// import { tags } from "../utils/seui.js"
// import UIComponent from "./UIComponent.js"
// const { div, header, ul, li } = tags
// export const Inventory = (state) => new UIComponent({ // TEST
// 	name: "inventory",
// 	state,
// 	isCard: true,
// 	isVisible: false,
// 	isDraggable: true,
// },
// 	header("Inventory"),
// 	ul({
// 		oncreate: (e) => {
// 			const ui = e.detail.ui
// 			// subscribe to player changes for updates
// 			state.player.subscribe((player) => {
// 				if (player == null || player.inventory.length === 0) {
// 					ui.replaceChildren(li({ class: "no-items" }, "No items..."))
// 					return
// 				}
// 				ui.replaceChildren(...player.inventory.map(item => li(
// 					div({ class: "item-name" }, item.name),
// 					div({ class: "item-amount" }, `Amount: ${item.amount}`)
// 				)))
// 			}, true)
// 		}
// 	})
// )
// export default Inventory

// on the index.js
// render all UI components:
// state.ui.forEach(ui => {
// 	if (ui instanceof UIComponent) {
// 		root.appendChild(ui.render())
// 	} else {
// 		root.appendChild(ui)
// 	}
// })
