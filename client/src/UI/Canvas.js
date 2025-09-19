import "./Canvas.css"
import { tags } from "./index.js"
import Renderer from "../Renderer.js"
import KeyControl from "../control/KeyControl.js"
import TouchControl from "../control/TouchControl.js"

const { canvas } = tags

/**
 * Game canvas element.
 * @type {HTMLCanvasElement}
 */
//@ts-ignore
let _canvas = canvas({ class: "ui-canvas", id: "game-canvas" })

/**
 * @type {Renderer|null} - The renderer for the game.
 */
let _renderer = null

/**
 * @type {KeyControl|null} - The key control for the game.
 */
let _keyControl = null

/**
 * @type {TouchControl|null} - The touch control for the game.
 */
let _touchControl = null

/**
 * Initializes the game canvas by setting the canvas dimensions and creating the renderer, key control, and touch control.
 * Adds a window resize event listener to update the canvas dimensions when the window is resized.
 *
 * @returns {HTMLCanvasElement} The initialized game canvas.
 */
export default function CanvasUI() {
	_canvas.width = window.innerWidth
	_canvas.height = window.innerHeight

	_renderer = new Renderer(_canvas)
	_keyControl = new KeyControl()
	_touchControl = new TouchControl(_canvas, _renderer)

	// add event listeners
	window.addEventListener("resize", onResize)
	return _canvas
}

/**
 * Removes all event listeners and releases any resources used by the game UI.
 */
export function remove() {
	_renderer?.remove()
	_keyControl?.remove()
	_touchControl?.remove()

	// remove event listeners
	window.removeEventListener("resize", onResize)
}

/**
 * Resizes the canvas to the window size.
 */
function onResize() {
	_canvas.width = window.innerWidth
	_canvas.height = window.innerHeight
}
