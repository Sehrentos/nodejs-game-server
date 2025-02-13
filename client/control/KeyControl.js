import { State } from "../State.js"

/**
 * @class KeyControl
 * @description Handles player key controls
 */
export default class KeyControl {
	constructor() {
		// binds the `onKeydown` method to the `this` context
		this._onKeydown = this.onKeydown.bind(this)

		// add event listener
		window.addEventListener("keydown", this._onKeydown)
	}

	remove() {
		window.removeEventListener("keydown", this._onKeydown)
	}

	onKeydown(e) {
		if (State.player == null || State.map == null) return false
		// exclude keydown event while in any input element
		if ((e.target?.tagName ?? "") === "INPUT") return false

		// handle movement, by sending a message to the server
		// the server will handle the movement
		// and update entity position
		// then it will send an update to the client
		// and next render cycle will update the player position
		if (!KeyControl.KEYS_MOVE.includes(e.code)) return false

		// handle movement
		this.handleMovement(e.code)
		return true;
	}

	/**
	 * Handles the movement of the player based on the key code input.
	 * TODO: Updates the player's direction and position on the client side for immediate feedback.
	 * Sends a WebSocket message to the server to update the player's movement state.
	 *
	 * @param {string} keyCode - The code of the key pressed, indicating the movement direction.
	 */
	handleMovement(keyCode) {
		// TODO client side prediction for moving (immediate feedback)
		// switch (e.code) {
		// 	case "KeyA":
		// 	case "ArrowLeft":
		// 		this.entity.dir = 0
		// 		if (this.entity.lastX > 0) {
		// 			this.entity.lastX--
		// 		}
		// 		break
		// 	case "KeyD":
		// 	case "ArrowRight":
		// 		this.entity.dir = 1
		// 		if (this.entity.lastX < State.map.width) {
		// 			this.entity.lastX++
		// 		}
		// 		break
		// 	case "KeyW":
		// 	case "ArrowUp":
		// 		this.entity.dir = 2
		// 		if (this.entity.lastY > 0) {
		// 			this.entity.lastY--
		// 		}
		// 		break
		// 	case "KeyS":
		// 	case "ArrowDown":
		// 		this.entity.dir = 3
		// 		if (this.entity.lastY < State.map.height) {
		// 			this.entity.lastY++
		// 		}
		// 		break
		// 	default:
		// 		break
		// }

		// send websocket if it's open
		if (State.socket != null && State.socket.readyState === WebSocket.OPEN) {
			State.socket.send(JSON.stringify({ type: "move", code: keyCode }));
		}
	}

	static KEYS_MOVE = ["KeyA", "KeyD", "KeyW", "KeyS", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
}