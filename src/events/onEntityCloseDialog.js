/**
 * Handles the close event on the NPC dialog from the player.
 * Player stopped interacting with the NPC.
 * 
 * @param {import("../models/Entity.js").Entity} entity
 * @param {{type:string,gid:string}} data
 */
export function onEntityCloseDialog(entity, data) {
    console.log(`[Event.onEntityCloseDialog] "${entity.name}" stopped interacting with NPC (gid: ${data.gid})`)
    entity.control._canMove = true
}