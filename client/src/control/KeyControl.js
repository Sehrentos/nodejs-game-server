import { ENTITY_MOVE_STEP } from "../../../shared/Constants.js"
// import { DIRECTION } from "../../../shared/enum/Entity.js"
import { SKILL_ID } from "../../../shared/enum/Skill.js"
import Events from "../Events.js"
import { sendKeyboardMove } from "../events/sendKeyboardMove.js"
import { sendSkill } from "../events/sendSkill.js"

/**
 * @class KeyControl
 * @description Handles player key controls
 */
export default class KeyControl {
	/**
	 * @param {import("../State.js").State} state
	 */
	constructor(state) {
		/** @type {import("../State.js").State} */
		this.state = state

		this.cooldown = 0 // TODO new Cooldown()
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
		if (this.state.player.value == null || this.state.map.value == null) return false
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
			// TODO use Events.emit("ui-skill-use", { source: "KeyControl", key: e.code });
			this.handleSkill(e.code)
			return true;
		}

		// Exit game UI
		if (e.code === "Escape") {
			Events.emit("ui-exit-game-toggle", { source: "KeyControl", key: e.code });
			return true;
		}

		// Toggle character UI or accordion
		// Alt + C to toggle character UI
		// C to toggle accordion open/close
		if (e.code === "KeyC") {
			if (e.altKey) {
				// Events.emit("ui-character-toggle", { source: "KeyControl", key: e.code });
				Events.emit("toggle", { id: "character" });
				return true;
			}
			Events.emit("ui-accordion-toggle", { id: "character", source: "KeyControl", key: e.code });
			return true;
		}

		// Toggle inventory UI
		if (e.code === "KeyI") {
			//Events.emit("ui-inventory-toggle", { source: "KeyControl", key: e.code });
			// this.state.ui.get("inventory").toggle() // TEST
			Events.emit("toggle", { id: "inventory" });
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
		// client side prediction for moving (immediate feedback)
		const timestamp = Date.now()
		const entity = this.state.player.value
		if (entity == null) return

		// entity must be alive
		if (entity.hp <= 0) return
		// TODO how to get entity.control.isMovementBlocked ?

		// check cooldown expired
		if (this.cooldown > timestamp) return
		this.cooldown = timestamp + (entity.speed * ENTITY_MOVE_STEP) - entity.latency

		// client side prediction for movement
		// switch (keyCode) {
		// 	case "KeyA":
		// 	case "ArrowLeft":
		// 		entity.dir = DIRECTION.LEFT
		// 		if (entity.lastX > 0) {
		// 			// entity.lastX--
		// 			entity.lastX -= ENTITY_MOVE_STEP
		// 		}
		// 		break
		// 	case "KeyD":
		// 	case "ArrowRight":
		// 		entity.dir = DIRECTION.RIGHT
		// 		if (entity.lastX < this.state.map.value.width) {
		// 			// entity.lastX++
		// 			entity.lastX += ENTITY_MOVE_STEP
		// 		}
		// 		break
		// 	case "KeyW":
		// 	case "ArrowUp":
		// 		entity.dir = DIRECTION.UP
		// 		if (entity.lastY > 0) {
		// 			// entity.lastY--
		// 			entity.lastY -= ENTITY_MOVE_STEP
		// 		}
		// 		break
		// 	case "KeyS":
		// 	case "ArrowDown":
		// 		entity.dir = DIRECTION.DOWN
		// 		if (entity.lastY < this.state.map.value.height) {
		// 			// entity.lastY++
		// 			entity.lastY += ENTITY_MOVE_STEP
		// 		}
		// 		break
		// 	default:
		// 		break
		// }

		// send websocket if it's open
		this.state?.socket?.send(sendKeyboardMove(keyCode));
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
			this.state?.socket?.send(sendSkill(skillId));
		}
	}

	static KEYS_MOVE = ["KeyA", "KeyD", "KeyW", "KeyS", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]

	static KEYS_SKILL = ["Digit1", "Numpad1", "Digit2", "Numpad2", "Digit3", "Numpad3", "Digit4", "Numpad4"]
}
