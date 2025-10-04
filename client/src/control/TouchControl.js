import { PLAYER_TOUCH_AREA_SIZE } from "../../../shared/Constants.js"
import { findMapEntitiesInRadius } from "../../../shared/utils/EntityUtils.js"
import { sendTouchPosition } from "../events/sendTouchPosition.js"

/**
 * @class TouchControl
 * @description Handles player touch controls
 */
export default class TouchControl {
	/**
	 * @param {import("../State.js").State} state
	 */
	constructor(state) {
		/** @type {import("../State.js").State} */
		this.state = state

		/**
		 * @type {HTMLCanvasElement}
		 */
		this.canvas = state.canvas

		/**
		 * @type {import("../Renderer").default}
		 */
		this.renderer = state.renderer

		// binds the methods to the `this` context
		this._onClick = this.onClick.bind(this)
		this._onMouseMove = this.onMouseMove.bind(this)
		// TODO touch events

		// add event listeners
		this.canvas.addEventListener("click", this._onClick)
		this.canvas.addEventListener("mousemove", this._onMouseMove)
	}

	/**
	 * Removes all touch control event listeners.
	 */
	remove() {
		this.canvas.removeEventListener("click", this._onClick)
		this.canvas.removeEventListener("mousemove", this._onMouseMove)
	}

	/**
	 * Handles the click event on the canvas.
	 *
	 * @param {MouseEvent} event - The mouse event.
	 */
	onClick(event) {
		event.preventDefault()
		event.stopPropagation()

		if (this.canvas == null || this.state.map.value == null || this.state.socket == null) return
		const { x, y } = this.getMousePosition(event)

		// send a "click" message to the server if it's open
		// server EntityControl.onClickPosition
		this.state.socket.send(sendTouchPosition(x, y))

		// client-side predictions
		this.state.playerControl?.touchPosition(x, y)
	}

	/**
	 * Handles the mouse move event on the canvas.
	 *
	 * Updates the mouse cursor style based on the presence of entities
	 * within a 4-cell radius at the current mouse position. If entities
	 * are found, the cursor changes to a pointer, otherwise it defaults
	 * to the standard cursor.
	 *
	 * @param {MouseEvent} event - The mouse move event.
	 */
	onMouseMove(event) {
		if (this.canvas == null || this.state.map.value == null) return
		const { x, y } = this.getMousePosition(event)
		const stack = findMapEntitiesInRadius(this.state.map.value, x, y, PLAYER_TOUCH_AREA_SIZE)

		// change mouse cursor to pointer
		if (stack.length) {
			this.canvas.style.cursor = "pointer"
		} else {
			this.canvas.style.cursor = "default"
		}
	}

	//#region utilities

	/**
	 * Gets the mouse position relative to the canvas element.
	 *
	 * @param {MouseEvent} event - The mouse event.
	 * @returns {{x: number, y: number}} - The mouse position relative to the element.
	 */
	getMousePosition(event) {
		let rect = this.canvas.getBoundingClientRect();
		let x = event.clientX - rect.left;
		let y = event.clientY - rect.top;
		// V2 take the camera position into account
		x += this.renderer.camX
		y += this.renderer.camY
		return { x, y };
	}

	//#endregion utilities
}
