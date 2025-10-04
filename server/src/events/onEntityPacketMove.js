import { DIR } from "../../../shared/enum/Entity.js"

/**
 * Handles the movement of the player based on WebSocket messages.
 * The `code` property of the message is used to determine the direction of the movement.
 * The player is moved if the direction is valid and the movement timer has expired.
 * The movement is based on the player's direction and current speed.
 * Updates the player's position on the map while ensuring it stays within boundaries.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity - The player entity
 * @param {import("../../../client/src/events/sendKeyboardMove.js").TKeyboardMovePacket} json - The move packet from the client
 * @param {number} timestamp - The current timestamp or performance.now().
 */
export default function onEntityPacketMove(entity, json, timestamp) {
	const ctrl = entity.control
	ctrl.stopAttack()
	ctrl.stopFollow()
	ctrl.stopMoveTo()
	switch (json.code) {
		case "KeyA":
		case "ArrowLeft":
			ctrl.move(DIR.LEFT, timestamp)
			break
		case "KeyD":
		case "ArrowRight":
			ctrl.move(DIR.RIGHT, timestamp)
			break
		case "KeyW":
		case "ArrowUp":
			ctrl.move(DIR.UP, timestamp)
			break
		case "KeyS":
		case "ArrowDown":
			ctrl.move(DIR.DOWN, timestamp)
			break
		default:
			break
	}
}
