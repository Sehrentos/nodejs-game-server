import { DIRECTION, ENTITY_TYPE } from "../enum/Entity.js"
import { WorldMap } from "../models/WorldMap.js"

/**
 * **NPC** Server update tick callback. Used to do NPC actions etc.
 * 
 * @param {import("../models/Entity.js").Entity} npc
 * @param {number} timestamp 
 */
export default function onEntityUpdateNPC(npc, timestamp) {
    try {
        // const ctrl = npc.control
        // const map = ctrl.map
        // const world = ctrl.world
        if (npc.control.map.isTown) {
            return moveEntitiesAroundNPC(npc, Math.round(npc.range / 2), timestamp)
        }

    } catch (ex) {
        console.error(`[Event.onEntityUpdateNPC] ${npc.gid} error:`, ex.message || ex || '[no-code]');
    }
}

/**
 * Moves entities around the NPC by making them move away from the NPC.
 * This is useful for NPCs that should be easily accessible in crowded spaces like stores.
 * 
 * @param {import("../models/Entity.js").Entity} npc
 * @param {number} range
 * @param {number} timestamp
 */
function moveEntitiesAroundNPC(npc, range, timestamp) {
    const nearbyEntities = WorldMap.findEntitiesInRadius(npc.control.map, npc.lastX, npc.lastY, range)
        .filter(ent => ent.gid !== npc.gid) // exclude itself

    if (nearbyEntities.length === 0) return

    for (const entity of nearbyEntities) {
        if (entity.type === ENTITY_TYPE.PLAYER) {
            // move player away from the NPC
            entity.control.move(DIRECTION.DOWN, timestamp)
        }
    }
}
