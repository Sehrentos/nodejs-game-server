import "./Accordion.css"
import { tags } from "./index.js"
import { Events } from "../State.js"

const { div } = tags

/**
 * An `.ui-accordion` component that can be expanded or collapsed to show or hide content.
 * Usage:
 * ```js
 * AccordionUI({ id: "myId" }, "Accordion title", "Accordion content")
 * ```
 *
 * It listens for the `ui-accordion-toggle` event to toggle its visibility.
 * Usage:
 * ```js
 * Events.emit("ui-accordion-toggle", { id: "myId" });
 * ```
 *
 * @param {Object} props - The properties for the accordion.
 * @param {string} [props.id] - A identifier for the accordion instance.
 * @param {boolean} [props.isOpen] - Whether the accordion is initially open or closed.
 */
export default function Accordion(props = {}, ...children) {
	const key = props.id || String(performance.now()).replace(".", "-")

	// listen for event to toggle visibility
	// Events.emit("ui-accordion-toggle", { id: "myId" });
	Events.off("ui-accordion-toggle", toggle); // prevent duplicate listeners
	Events.on("ui-accordion-toggle", toggle);

	return div({ class: "ui-accordion", id: "ui-accordion-" + key, onclick },
		div({
			class: "header",
			"aria-expanded": props.isOpen, // ARIA for screen readers
			"aria-controls": "accordion-content-" + key // Link header to content
		}, children[0]),
		div({ class: `content ${props.isOpen ? "open" : ""}`, id: "accordion-content-" + key }, children[1])
	)
}

function onclick(e) {
	e.stopPropagation()
	if (e.target.closest("div.header")) {
		e.currentTarget
			.querySelector("div.content")
			.classList.toggle("open")
	}
}

/**
 * Toggle accordion content visibility
 * @param {Object} props
 * @param {string} [props.id] - The ID of the accordion to toggle.
 * @returns
 */
function toggle(props = {}) {
	document.querySelector(`#ui-accordion-${props.id} div.content`)?.classList.toggle("open")
}
