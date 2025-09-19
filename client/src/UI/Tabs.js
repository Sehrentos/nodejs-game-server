import "./Tabs.css"
import { tags } from "./index.js"

const { div } = tags

/**
 * A tabbed interface component that allows switching between different content panels.
 *
 * Examples:
 * ```js
 * import { Tabs, TabLinks, TabLink, TabContent } from "./Tabs.js"
 * Tabs(
 *   TabLinks(
 *     TabLink({ active: true }, "Tab 1"),
 *     TabLink("Tab 2"),
 *     TabLink("Tab 3"),
 *     TabLink("Tab 4"),
 *   ),
 *   TabContent({ active: true }, "Tab 1 content"),
 *   TabContent("Tab 2 content"),
 *   TabContent("Tab 3 content"),
 *   TabContent("Tab 4 content"),
 * )
 * // or with divs
 * Tabs(
 *   div({ class: "tab" },
 *     div({ class: "tablink active"}, "Tab 1"),
 *     div({ class: "tablink"}, "Tab 2"),
 *   ),
 *   div({ class: "tabcontent.active", div({ class:"stats" }, "My tab content 1")),
 *   div({ class: "tabcontent", div({ class:"stats" }, "My tab content 2")),
 * )
 * ```
 * @returns {HTMLElement}
 */
export default function Tabs(...children) {
	return div({ class: "ui-tabs", onclick }, ...children)
}

export { Tabs }

/** @param {Event} event */
function onclick(event) {
	// event.preventDefault()
	// event.stopPropagation()

	/** @type {HTMLElement|null} */
	// @ts-ignore has null check
	const target = event.target
	if (!target) return false

	/** @type {HTMLElement|null} */
	// @ts-ignore has null check
	const currentTarget = event.currentTarget
	if (!currentTarget) return false

	// was tablink clicked
	const targetTablink = target.closest(".tablink")
	if (!targetTablink) return false

	const tablinks = currentTarget.querySelectorAll(".tablink")
	if (!tablinks.length) return false

	const indexOfTablink = Array.prototype.indexOf.call(tablinks, targetTablink)
	if (indexOfTablink === -1) return false

	const tabContents = currentTarget.querySelectorAll(".tabcontent")
	if (!tabContents.length) return false

	const targetTabContent = tabContents[indexOfTablink]
	if (!targetTabContent) return false

	// Get all elements with class="tablinks" and remove the class "active"
	for (let i = 0; i < tablinks.length; i++) {
		tablinks[i].classList.remove("active")
	}

	// Get all elements with class="tabcontent" and remove the class "active"
	for (let i = 0; i < tabContents.length; i++) {
		tabContents[i].classList.remove("active")
	}

	// Show the current tab, and add an "active" class
	targetTablink.classList.add("active")
	targetTabContent.classList.add("active")
	return true
}

/**
 * Helper function to create a group of tab links.
 * @param  {...any} children - The tab link elements.
 * @example TabLinks(
 *   TabLink({ active: true }, "Tab 1"),
 *   TabLink({}, "Tab 2"),
 * )
 * @returns {HTMLElement}
 */
export const TabLinks = (...children) => div({ class: "tab" }, ...children)

/**
 * Helper function to create a single tab link.
 * @param {Object} props
 * @param {boolean} [props.active] - Whether this tab link is active.
 * @param  {...any} children - The content of the tab link.
 * @example TabLink({ active: true }, "Tab 1")
 * @returns {HTMLElement}
 */
export const TabLink = (props = {}, ...children) => div({ class: `tablink ${props.active ? "active" : ""}` }, ...children)

/**
 * Helper function to create a tab content panel.
 * @param {Object} props
 * @param {boolean} [props.active] - Whether this tab content is active.
 * @param  {...any} children - The content of the tab panel.
 * @example TabContent({ active: true }, div({ class:"stats" }, "My tab content 1"))
 * @returns
 */
export const TabContent = (props = {}, ...children) => div({ class: `tabcontent ${props.active ? "active" : ""}` }, ...children)
