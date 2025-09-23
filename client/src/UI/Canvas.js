import "./Canvas.css"

/**
 * Init the game canvas by setting the canvas dimensions.
 *
 * Adds a window resize event listener to update the canvas dimensions when the window is resized.
 *
 * @param {string} id - The ID of the canvas element.
 * @returns {HTMLCanvasElement} The initialized game canvas.
 */
export default function CanvasUI(id) {
	const canvas = document.createElement("canvas")
	canvas.className = "ui-canvas"
	canvas.id = id
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	// add event listeners
	window.addEventListener("resize", () => {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
	})
	return canvas
}
