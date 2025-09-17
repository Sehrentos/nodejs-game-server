import "./Dialog.css"
import { tags } from "./index.js"
import { Events } from "../State.js"

const { div } = tags

/**
 * An `.ui-dialog` component
 *
 * Toggle dialog visibility with:
 * ```js
 * Events.emit("ui-dialog-toggle", { id: "myDialogId" });
 * ```
 *
 * @param {Object} props
 * @param {string} [props.id] - Dialog ID
 * @param {boolean} [props.isVisible] - whether the dialog should be visible
 * @param {boolean} [props.isBackdropVisible] - whether the backdrop should be visible
 * @param {boolean} [props.isBackdropClose] - close the dialog on backdrop click
 * @param {(event:MouseEvent|TouchEvent,toggle:(p:{id:string})=>void)=>void} [props.onclick] - optional. override default click handler
 * @param {...any} children - dialog content
 */
export default function DialogUI(props = {}, ...children) {
	/** @type {string} - Dialog ID */
	const id = props.id || String(performance.now()).replace(".", "-")
	/** @type {boolean} - whether the dialog should be visible */
	const isVisible = props.isVisible || false
	/** @type {boolean} - whether the backdrop should be visible */
	const isBackdropVisible = props.isBackdropVisible || false
	/** @type {boolean} - close the dialog on backdrop click */
	const isBackdropClose = props.isBackdropClose || false

	const onclick = props.onclick || function (event) {
		/** @type {HTMLElement} - element where the event occurred */
		//@ts-ignore
		const target = event.target
		if (!target) return

		/** @type {HTMLDivElement} - element where the event is attached to */
		//@ts-ignore
		const currentTarget = event.currentTarget
		if (!currentTarget) return

		// the backdrop is clicked
		if (isBackdropClose && target.closest("div.ui-dialog-backdrop")) {
			toggle({ id })
			return
		}

		// find the close button
		const closeButton = target.closest(".ui-dialog-close")
		if (closeButton) {
			toggle({ id })
			return
		}
	}

	// listen for event to toggle visibility
	// Events.emit("ui-dialog-toggle", { id: "myDialogId" });
	Events.off("ui-dialog-toggle", toggle); // prevent duplicate listeners
	Events.on("ui-dialog-toggle", toggle);

	if (isBackdropVisible) {
		return div({
			id,
			class: "ui-dialog-backdrop" + (isVisible ? " open" : ""),
			onclick
		},
			div({ class: "ui card ui-dialog" }, ...children)
		)
	}
	return div({
		id,
		class: "ui card ui-dialog" + (isVisible ? " open" : ""),
		onclick
	}, ...children)
}

/**
 * Toggle dialog visibility
 * @param {Object} props
 * @param {string} [props.id] - Dialog ID
 */
function toggle(props = {}) {
	document.querySelector(`#${props.id}`)?.classList.toggle("open")
}
