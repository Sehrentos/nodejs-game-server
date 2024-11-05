import { State } from "../State.js"

/**
 * @class KeyControl
 * @description Handles player key controls
 */
export default class KeyControl {
	constructor(entity) {
		this.entity = entity
		this._onKeydown = this.onKeydown.bind(this)
	}
	bind() {
		window.addEventListener("keydown", this._onKeydown)
	}
	unbind() {
		window.removeEventListener("keydown", this._onKeydown)
	}
	onKeydown(e) {
		if (this.entity == null || State.map == null) return
		// handle movement, by sending a message to the server
		// the server will handle the movement
		// and update entity position
		// then it will send an update to the client
		// and next render cycle will update the player position
		if (!KeyControl.KEYS.includes(e.code)) return;
		State.socket?.send(JSON.stringify({ type: "move", code: e.code }));
		// TODO client side prediction for moving
		// switch (e.code) {
		// 	case "KeyA":
		// 	case "ArrowLeft":
		// 		this.entity.dir = 0
		// 		if (this.entity.x > 0) {
		// 			this.entity.x--
		// 		}
		// 		break
		// 	case "KeyD":
		// 	case "ArrowRight":
		// 		this.entity.dir = 1
		// 		if (this.entity.x < State.map.width) {
		// 			this.entity.x++
		// 		}
		// 		break
		// 	case "KeyW":
		// 	case "ArrowUp":
		// 		this.entity.dir = 2
		// 		if (this.entity.y > 0) {
		// 			this.entity.y--
		// 		}
		// 		break
		// 	case "KeyS":
		// 	case "ArrowDown":
		// 		this.entity.dir = 3
		// 		if (this.entity.y < State.map.height) {
		// 			this.entity.y++
		// 		}
		// 		break
		// 	default:
		// 		break
		// }
	}
	static KEYS = ["KeyA", "KeyD", "KeyW", "KeyS", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
}