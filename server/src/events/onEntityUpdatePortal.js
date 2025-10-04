import { COOLDOWN_PORTAL_USE } from "../../../shared/Constants.js"
import { TYPE } from "../../../shared/enum/Entity.js"
import { findMapEntitiesInRadius } from "../../../shared/utils/EntityUtils.js"

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

		// Finds players in the given radius around the entity
		// and teleports them to the next map
		const nearbyEntities = findMapEntitiesInRadius(map, portal.lastX, portal.lastY, portal.range)
			.filter(entity => entity.type === TYPE.PLAYER)

		if (nearbyEntities.length === 0) return

		for (const entity of nearbyEntities) {
			// player use portal again 5 seconds after last portal used
			if (entity.control._portalUseCd.isExpired(timestamp)) {
				entity.control._portalUseCd.set(timestamp + COOLDOWN_PORTAL_USE)
				world.changeMap(entity, portal.portalId, portal.portalX, portal.portalY)
			}
		}

	} catch (ex) {
		console.error(`[Event.onEntityUpdatePortal] ${portal.gid} error:`, ex.message || ex || '[no-code]');
	}
}
