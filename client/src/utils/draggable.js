/**
 * Makes an HTML element draggable.
 *
 * - Set data attribute `draggable` to `true` to indicate that the element can be dragged.
 * - Set data attribute `draggable-dragged` to `true` to indicate that the element was dragged from it's original position.
 *
 * @param {HTMLElement} element - The element to make draggable.
 * @returns {HTMLElement}
 *
 * @example
 * draggable(document.getElementById('myElement'))
 * draggable(div({ class: "ui card ui-skill-bar open" }))
 */
export default function draggable(element) {
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
	let isDragging = false, isTouch = false

	element.dataset.draggable = "true"
	element.addEventListener('mousedown', dragMouseDown)
	element.addEventListener('touchstart', dragMouseDown)

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	function dragMouseDown(e) {
		isTouch = e.type === 'touchstart'
		if (!isTouch) e.preventDefault()
		const { x, y } = getFirstTouchPosition(e)
		pos3 = x
		pos4 = y
		document.addEventListener('mouseup', closeDragElement)
		document.addEventListener('touchend', closeDragElement)
		document.addEventListener('mousemove', elementDrag)
		document.addEventListener('touchmove', elementDrag)
		element.dataset.draggableDragging = "false"
		isDragging = false
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	function elementDrag(e) {
		if (!isTouch) e.preventDefault()
		const { x, y } = getFirstTouchPosition(e)
		pos1 = pos3 - x
		pos2 = pos4 - y
		pos3 = x
		pos4 = y
		element.dataset.draggableDragged = "true"
		element.dataset.draggableDragging = "true"
		element.style.top = (element.offsetTop - pos2) + "px"
		element.style.left = (element.offsetLeft - pos1) + "px"
		isDragging = true
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	function closeDragElement(e) {
		document.removeEventListener('mouseup', closeDragElement)
		document.removeEventListener('touchend', closeDragElement)
		document.removeEventListener('mousemove', elementDrag)
		document.removeEventListener('touchmove', elementDrag)

		if (isDragging && !isTouch) {
			// Prevent the next click event after drag
			element.addEventListener('click', function preventClick(clickEvent) {
				clickEvent.stopImmediatePropagation()
				clickEvent.preventDefault()
				element.removeEventListener('click', preventClick, true)
			}, true)
		}

		isDragging = false
		element.dataset.draggableDragging = "false"
	}

	return element
}

/**
 * Add event listeners to `document` for drag events when element has attribute `data-draggable` set to `true`.
 *
 * Uses the following attributes on the element:
 * - `data-draggable` - an boolean that indicates that the element can be dragged
 * - `data-draggable-dragged` - an boolean that indicates that the element was dragged from it's original position
 * - `data-draggable-dragging` - an boolean that indicates that the element is currently being dragged
 *
 * @param {Object} props
 * @param {boolean} [props.resetOnResize=true] - optional. Reset the `draggable-dragged` attribute and position on window resize
 *
 * @returns {void}
 */
export function addDraggableEventListeners(props = {}) {
	let positions = { x: 0, y: 0 }, pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
	let isDragging = false, isTouch = false, resizeTimeout

	/** @type {HTMLElement} */
	let target

	document.addEventListener('mousedown', dragMouseDown)
	document.addEventListener('touchstart', dragMouseDown)

	// use window resize event to reset the state
	// removes dragged top & left position attributes
	if (props?.resetOnResize !== false) {
		window.addEventListener("resize", onResize)
	}

	function onResize() {
		if (resizeTimeout) return
		resizeTimeout = setTimeout(() => resizeTimeout = null, 100)
		// find any elements with attribute data-draggable-dragged
		document.querySelectorAll("[data-draggable-dragged]").forEach((/** @type {HTMLElement} */ui) => {
			ui.style.top = ui.style.left = ""
			ui.dataset.draggableDragged = "false"
		})
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	function dragMouseDown(e) {
		// @ts-ignore
		target = e.target.closest('[data-draggable="true"]')
		if (!target) return
		isTouch = e.type === 'touchstart'
		if (!isTouch) e.preventDefault()
		positions = getFirstTouchPosition(e)
		pos3 = positions.x
		pos4 = positions.y
		document.addEventListener('mouseup', closeDragElement)
		document.addEventListener('touchend', closeDragElement)
		document.addEventListener('mousemove', elementDrag)
		document.addEventListener('touchmove', elementDrag)
		target.dataset.draggableDragging = "false"
		isDragging = false
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	function elementDrag(e) {
		if (!isTouch) e.preventDefault()
		positions = getFirstTouchPosition(e)
		pos1 = pos3 - positions.x
		pos2 = pos4 - positions.y
		pos3 = positions.x
		pos4 = positions.y
		target.dataset.draggableDragged = "true"
		target.dataset.draggableDragging = "true"
		target.style.top = (target.offsetTop - pos2) + "px"
		target.style.left = (target.offsetLeft - pos1) + "px"
		isDragging = true
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	function closeDragElement(e) {
		document.removeEventListener('mouseup', closeDragElement)
		document.removeEventListener('touchend', closeDragElement)
		document.removeEventListener('mousemove', elementDrag)
		document.removeEventListener('touchmove', elementDrag)

		if (isDragging && !isTouch) {
			// Prevent the next click event after drag
			target.addEventListener('click', function preventClick(clickEvent) {
				clickEvent.stopImmediatePropagation()
				clickEvent.preventDefault()
				target.removeEventListener('click', preventClick, true)
			}, true)
		}

		isDragging = false
		target.dataset.draggableDragging = "false"
	}
}

/**
 * Helper function to get first touch position or mouse position.
 * @param {MouseEvent|TouchEvent} e
 * @returns {{x: number, y: number}}
 */
function getFirstTouchPosition(e) {
	// @ts-ignore is TouchEvent
	const touches = e.changedTouches
	if (!touches) {
		// @ts-ignore is MouseEvent
		return { x: e.clientX, y: e.clientY }
	}
	return {
		x: touches[0].clientX,
		y: touches[0].clientY
	}
}
