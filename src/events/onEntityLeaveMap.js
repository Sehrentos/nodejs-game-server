import { COOLDOWN_PORTAL_USE } from "../Constants.js";

/**
 * Called when the player entity leaves a map.
 * 
 * @param {import("../models/Entity.js").Entity} entity
 * @param {import("../models/WorldMap.js").WorldMap} map - The map the player is entering
 * @param {import("../models/WorldMap.js").WorldMap} oldMap - The map the player was previously in
 */
export default async function onEntityLeaveMap(entity, map, oldMap) {
    try {
        const ctrl = entity.control;

        console.log(`[Event.onEntityLeaveMap] id:${entity.id} "${entity.name}" leave map: "${oldMap?.name ?? ''}" to "${map.name}"`)

        // set teleport cooldown active
        // this is good when you happen teleport to a new map but land on portal
        // e.g. chat command "/changemap 1 100 100"
        // Note: also set in the onEntityEnterMap
        ctrl._portalUseCd.set(performance.now() + COOLDOWN_PORTAL_USE)

        ctrl.stopAttack()
        ctrl.stopFollow()
        ctrl.stopMoveTo()
        return true

    } catch (ex) {
        console.error(`[Event.onEntityLeaveMap] id:${entity.id} "${entity.name}" leave map error:`, ex.message || ex || '[no-code]');
        return false
    }
}
