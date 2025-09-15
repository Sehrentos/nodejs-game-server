/**
 * Calculates the width and height of a text string when rendered in the browser.
 *
 * Note: The text is appended to the body of the document, and removed after the dimensions are measured.
 * Avoid using this inside the Renderer class, as it can cause performance issues.
 *
 * @param {string} text - The text content whose dimensions are to be measured.
 * @param {string} [fontSize="10px"] - The font size to apply to the text.
 * @param {string} [fontFamily="Arial"] - The font family to apply to the text.
 * @returns {{width: number, height: number}} An object containing the width and height of the text.
 */
export function getTextOffsetSize(text, fontSize = "10px", fontFamily = "Arial") {
	let width = 0
	let height = 0
	let span = document.createElement("span")
	span.setAttribute("style", `position:absolute;top:-200;font-size:${fontSize};font-family:${fontFamily}`)
	span.textContent = text
	document.body.appendChild(span)
	width = span.offsetWidth
	height = span.offsetHeight
	document.body.removeChild(span)
	span = null
	return { width, height }
}

/**
 * Makes an HTML element draggable.
 *
 * @param {any} element - The element to make draggable.
 */
export function draggable(element) {
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
