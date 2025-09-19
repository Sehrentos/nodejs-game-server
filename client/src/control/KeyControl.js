import { SKILL_ID } from "../../../shared/enum/Skill.js"
import { State } from "../State.js"
import { sendKeyboardMove } from "../events/sendKeyboardMove.js"
import { sendSkill } from "../events/sendSkill.js"

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

	/** @param {KeyboardEvent} e  */
	onKeydown(e) {
		if (State.player.value == null || State.map.value == null) return false
		// @ts-ignore exclude keydown event while in any input element
		if ((e.target?.tagName ?? "") === "INPUT") return false

		// handle movement, by sending a message to the server
		// the server will handle the movement
		// and update entity position
		// then it will send an update to the client
		// and next render cycle will update the player position
		if (KeyControl.KEYS_MOVE.includes(e.code)) {
			this.handleMovement(e.code)
			return true;
		}

		// handle skill use
		if (KeyControl.KEYS_SKILL.includes(e.code)) {
			// TODO use State.events.emit("ui-skill-use", { source: "KeyControl", key: e.code });
			this.handleSkill(e.code)
			return true;
		}

		// Exit game UI
		if (e.code === "Escape") {
			State.events.emit("ui-exit-game-toggle", { source: "KeyControl", key: e.code });
			return true;
		}

		// Toggle character UI or accordion
		// Alt + C to toggle character UI
		// C to toggle accordion open/close
		if (e.code === "KeyC") {
			if (e.altKey) {
				State.events.emit("ui-character-toggle", { source: "KeyControl", key: e.code });
				return true;
			}
			State.events.emit("ui-accordion-toggle", { id: "character", source: "KeyControl", key: e.code });
			return true;
		}

		return false;
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
		// 		if (this.entity.lastX < State.map.value.width) {
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
		// 		if (this.entity.lastY < State.map.value.height) {
		// 			this.entity.lastY++
		// 		}
		// 		break
		// 	default:
		// 		break
		// }

		// send websocket if it's open
		State.socket?.send(sendKeyboardMove(keyCode));
	}

	handleSkill(keyCode) {
		console.log(`keycode: ${keyCode}`);
		let skillId = 0
		switch (keyCode) {
			case "Digit1":
			case "Numpad1":
				skillId = SKILL_ID.HEAL
				break
			case "Digit2":
			case "Numpad2":
				skillId = SKILL_ID.STRIKE
				break
			case "Digit3":
			case "Numpad3":
				skillId = SKILL_ID.TAME
				break
			// case "Digit4":
			// case "Numpad4":
			// 	skillId = SKILL_ID.NONE
			// 	break
			default:
				break
		}
		if (skillId) {
			State.socket?.send(sendSkill(skillId));
		}
	}

	static KEYS_MOVE = ["KeyA", "KeyD", "KeyW", "KeyS", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]

	static KEYS_SKILL = ["Digit1", "Numpad1", "Digit2", "Numpad2", "Digit3", "Numpad3", "Digit4", "Numpad4"]
}
