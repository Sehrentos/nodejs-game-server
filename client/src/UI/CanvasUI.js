import m from "mithril"
import "./CanvasUI.css"
import Renderer from "../Renderer.js"
import KeyControl from "../control/KeyControl.js"
import TouchControl from "../control/TouchControl.js"

/**
 * @class CanvasUI
 * @description Creates a canvas element for the game and manages the renderer and user controls.
 * @exports CanvasUI
 */
export default class CanvasUI {
	/**
	 * @param {m.Vnode<{id: string}>} vnode 
	 */
	constructor(vnode) {
		this.id = vnode.attrs.id || "game-canvas"

		/**
		 * @type {HTMLCanvasElement|null}
		 */
		this.canvas = null

		/**
		 * @type {Renderer|null} - The renderer for the game.
		 */
		this.renderer = null

		/**
		 * @type {KeyControl|null} - The key control for the game.
		 */
		this.keyControl = null

		/**
		 * @type {TouchControl|null} - The touch control for the game.
		 */
		this.touchControl = null

		// binds the methods to the `this` context
		this._onResize = this.onResize.bind(this)
	}

	// #region mithril events
	oncreate(vnode) {
		this.canvas = vnode.dom
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight

		this.renderer = new Renderer(this.canvas)
		this.keyControl = new KeyControl()
		this.touchControl = new TouchControl(this.canvas, this.renderer)

		// add event listeners
		window.addEventListener("resize", this._onResize)
	}

	onremove() {
		this.renderer.remove()
		this.keyControl.remove()
		this.touchControl.remove()

		// remove event listeners
		window.removeEventListener("resize", this._onResize)
	}

	view(vnode) {
		return m("canvas.ui-canvas", { id: this.id })
	}
	// #endregion mithril events

	/**
	 * Resizes the canvas to the window size.
	 */
	onResize() {
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
	}
}