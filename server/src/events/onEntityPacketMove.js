import { DIRECTION } from "../../../shared/enum/Entity.js"

/**
 * Handles the movement of the player based on WebSocket messages.
 * The `code` property of the message is used to determine the direction of the movement.
 * The player is moved if the direction is valid and the movement timer has expired.
 * The movement is based on the player's direction and current speed.
 * Updates the player's position on the map while ensuring it stays within boundaries.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity - The player entity
 * @param {{code:string}} json - WebSocket message containing the movement information.
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
			ctrl.move(DIRECTION.LEFT, timestamp)
			break
		case "KeyD":
		case "ArrowRight":
			ctrl.move(DIRECTION.RIGHT, timestamp)
			break
		case "KeyW":
		case "ArrowUp":
			ctrl.move(DIRECTION.UP, timestamp)
			break
		case "KeyS":
		case "ArrowDown":
			ctrl.move(DIRECTION.DOWN, timestamp)
			break
		default:
			break
	}
}
