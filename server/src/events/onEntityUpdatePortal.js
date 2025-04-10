import { COOLDOWN_PORTAL_USE } from "../../../shared/Constants.js"
import { ENTITY_TYPE } from "../../../shared/enum/Entity.js"
import { WorldMap } from "../../../shared/models/WorldMap.js"

/**
 * **Portal** Server update tick callback. Used to do animations etc.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} portal
 * @param {number} timestamp
 */
export default function onEntityUpdatePortal(portal, timestamp) {
    try {
        const ctrl = portal.control
        const map = ctrl.map
        const world = ctrl.world

        // Finds entities in the given radius around the entity
        // and teleports them to the next map
        const nearbyEntities = WorldMap.findEntitiesInRadius(map, portal.lastX, portal.lastY, portal.range)
            .filter(ent => ent.gid !== portal.gid) // exclude the portal itself

        if (nearbyEntities.length === 0) return

        for (const entity of nearbyEntities) {
            // only players can be warped
            if (entity.type === ENTITY_TYPE.PLAYER) {
                // player use portal again 5 seconds after last portal used
                if (entity.control._portalUseCd.isExpired(timestamp)) {
                    entity.control._portalUseCd.set(timestamp + COOLDOWN_PORTAL_USE)
                    world.joinMap(entity, portal.portalName, portal.portalX, portal.portalY)
                }
            }
        }

    } catch (ex) {
        console.error(`[Event.onEntityUpdatePortal] ${portal.gid} error:`, ex.message || ex || '[no-code]');
    }
}
