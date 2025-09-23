import { PLAYER_TOUCH_AREA_SIZE } from "../../../shared/Constants.js"
import { WorldMap } from "../../../shared/models/WorldMap.js"
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

		// client side move predictions
		// const timestamp = Date.now()
		const entities = WorldMap.findEntitiesInRadius(this.state.map.value, x, y, PLAYER_TOUCH_AREA_SIZE)
			.filter(entity => entity.gid !== this.state.player.value?.gid) // exclude self

		// TODO remove logs, when done testing
		console.log(x, y, entities)

		// // if no entities found
		// // start moving to the clicked position
		// if (entities.length === 0) {
		// 	moveTo(json.x, json.y, timestamp)
		// 	return
		// }

		// // 1. priority - Monster (alive)
		// const mobs = entities.filter(e => e.type === ENTITY_TYPE.MONSTER && e.hp > 0)
		// if (mobs.length) {
		// 	return touch(player, mobs[0], timestamp)
		// }

		// // 2. priority - NPC
		// const npcs = entities.filter(e => e.type === ENTITY_TYPE.NPC)
		// if (npcs.length) {
		// 	return touch(player, npcs[0], timestamp)
		// }

		// // 3. priority - Player
		// const players = entities.filter(e => e.type === ENTITY_TYPE.PLAYER)
		// if (players.length) {
		// 	return touch(player, players[0], timestamp)
		// }

		// // 4. priority - PORTAL
		// const portals = entities.filter(e => e.type === ENTITY_TYPE.PORTAL)
		// if (portals.length) {
		// 	return touch(player, portals[0], timestamp)
		// }

		// // 5. move to position
		// ctrl.moveTo(json.x, json.y, timestamp)
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
		const stack = WorldMap.findEntitiesInRadius(this.state.map.value, x, y, PLAYER_TOUCH_AREA_SIZE)

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
