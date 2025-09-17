import "./Canvas.css"
import { tags } from "./index.js"
import Renderer from "../Renderer.js"
import KeyControl from "../control/KeyControl.js"
import TouchControl from "../control/TouchControl.js"

const { canvas } = tags

const id = "game-canvas"

/**
 * @type {HTMLCanvasElement|null}
 */
let _canvas = null

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

export default function CanvasUI() {
	//@ts-ignore
	_canvas = canvas({ class: "ui-canvas", id })
	oncreate()
	return _canvas
}

function oncreate() {
	_canvas.width = window.innerWidth
	_canvas.height = window.innerHeight

	_renderer = new Renderer(_canvas)
	_keyControl = new KeyControl()
	_touchControl = new TouchControl(_canvas, _renderer)

	// add event listeners
	window.addEventListener("resize", onResize)
}

function onremove() {
	_renderer.remove()
	_keyControl.remove()
	_touchControl.remove()

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
