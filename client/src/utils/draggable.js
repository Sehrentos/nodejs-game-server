/**
 * Makes an HTML element draggable.
 *
 * TODO does this work with touch events?
 *
 * @param {HTMLElement} element - The element to make draggable.
 * @returns {HTMLElement}
 */
export default function draggable(element) {
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
	let isDragging = false, isTouch = false

	// element.style.cursor = "grab";
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
		element.style.top = (element.offsetTop - pos2) + "px"
		element.style.left = (element.offsetLeft - pos1) + "px"
		// element.style.cursor = "grabbing";
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
		// element.style.cursor = "grab";
		if (isDragging && !isTouch) {
			// Prevent the next click event after drag
			element.addEventListener('click', function preventClick(clickEvent) {
				clickEvent.stopImmediatePropagation()
				clickEvent.preventDefault()
				element.removeEventListener('click', preventClick, true)
			}, true)
		}
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
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

	return element
}
