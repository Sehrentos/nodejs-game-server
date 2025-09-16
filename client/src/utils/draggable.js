/**
 * Makes an HTML element draggable.
 *
 * TODO does this work with touch events?
 *
 * @param {any} element - The element to make draggable.
 */
export default function draggable(element) {
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
	let isDragging = false

	// element.style.cursor = "grab";
	element.onmousedown = dragMouseDown

	function dragMouseDown(e) {
		e.preventDefault()
		pos3 = e.clientX
		pos4 = e.clientY
		document.onmouseup = closeDragElement
		document.onmousemove = elementDrag
		isDragging = false
	}

	function elementDrag(e) {
		e.preventDefault()
		pos1 = pos3 - e.clientX
		pos2 = pos4 - e.clientY
		pos3 = e.clientX
		pos4 = e.clientY
		element.style.top = (element.offsetTop - pos2) + "px"
		element.style.left = (element.offsetLeft - pos1) + "px"
		// element.style.cursor = "grabbing";
		isDragging = true
	}

	function closeDragElement(e) {
		document.onmouseup = null
		document.onmousemove = null
		// element.style.cursor = "grab";
		if (isDragging) {
			// Prevent the next click event after drag
			const preventClick = function (clickEvent) {
				clickEvent.stopImmediatePropagation()
				clickEvent.preventDefault()
				element.removeEventListener('click', preventClick, true)
			}
			element.addEventListener('click', preventClick, true)
		}
	}
}
