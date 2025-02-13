import { DIRECTION } from "../enum/Entity.js"

/**
 * Handles the movement of the player based on WebSocket messages.
 * The `code` property of the message is used to determine the direction of the movement.
 * The player is moved if the direction is valid and the movement timer has expired.
 * The movement is based on the player's direction and current speed.
 * Updates the player's position on the map while ensuring it stays within boundaries.
 * The movement is constrained by a delay calculated from speed and speedMultiplier.
 *
 * @param {import("../models/Entity.js").Entity} entity - The player entity
 * @param {{code:string}} json - WebSocket message containing the movement information.
 */
export function onEntityMove(entity, json) {
    const timestamp = performance.now()
    entity.control.stopAttack()
    entity.control.stopFollow()
    entity.control.stopMoveTo()
    switch (json.code) {
        case "KeyA":
        case "ArrowLeft":
            entity.control.move(DIRECTION.LEFT, timestamp)
            break
        case "KeyD":
        case "ArrowRight":
            entity.control.move(DIRECTION.RIGHT, timestamp)
            break
        case "KeyW":
        case "ArrowUp":
            entity.control.move(DIRECTION.UP, timestamp)
            break
        case "KeyS":
        case "ArrowDown":
            entity.control.move(DIRECTION.DOWN, timestamp)
            break
        default:
            break
    }
}