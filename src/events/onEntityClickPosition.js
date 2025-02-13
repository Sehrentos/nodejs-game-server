import { ENTITY_TOUCH_AREA_SIZE } from "../Constants.js"
import { ENTITY_TYPE } from "../enum/Entity.js"
import { WorldMap } from "../models/WorldMap.js"

/**
 * Handles the click event on the map from the player.
 * If an entity is found within a touch area radius, interact with the entity.
 * 
 * @param {import("../models/Entity.js").Entity} player
 * @param {Object} json - The JSON object containing click coordinates.
 * @param {number} json.x - The x-coordinate of the click.
 * @param {number} json.y - The y-coordinate of the click.
 */
export function onEntityClickPosition(player, json) {
    player.control.stopFollow()
    player.control.stopMoveTo()

    if (player.hp <= 0) return // must be alive

    const timestamp = performance.now()

    // check if player is in range of entity
    // find entities at clicked position in 4-cell radius
    const entities = WorldMap.findEntitiesInRadius(player.control.map, json.x, json.y, ENTITY_TOUCH_AREA_SIZE)
        .filter(entity => entity.gid !== player.gid) // exclude self

    // if no entities found
    // start moving player to the clicked position
    if (entities.length === 0) {
        player.control.moveTo(json.x, json.y, timestamp)
        return
    }

    for (const entity of entities) {
        if (entity.type === ENTITY_TYPE.MONSTER && entity.hp > 0) {
            player.control.attack(entity, timestamp)
            return
        }
        else if (entity.type === ENTITY_TYPE.NPC) {
            player.control.follow(entity, timestamp)
            player.control.touch(entity, timestamp)
            return
        }
        else if (entity.type === ENTITY_TYPE.PORTAL) {
            player.control.moveTo(json.x, json.y, timestamp)
            return
        }
        else if (entity.type === ENTITY_TYPE.PLAYER) {
            console.log(`[Event.onEntityClickPosition] "${player.name}" is interacting with "${entity.name}" x:${json.x}, y:${json.y})`)
        }
    }
}