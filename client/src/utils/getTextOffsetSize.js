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
