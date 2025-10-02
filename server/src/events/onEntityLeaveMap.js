import { COOLDOWN_PORTAL_USE } from "../../../shared/Constants.js";
import { ENTITY_TYPE } from "../../../shared/enum/Entity.js";
import { sendMapRemoveEntity } from "./sendMap.js";

/**
 * Called when the player entity leaves a map.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 * @param {import("../../../shared/models/WorldMap.js").WorldMap} map - The map the player is entering
 * @param {import("../../../shared/models/WorldMap.js").WorldMap} oldMap - The map the player was previously in
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

		// notify other players about the player entering the map
		const entityPets = map.entities.filter(e => e.type === ENTITY_TYPE.PET && e.owner.gid === entity.gid)
		for (let other of map.entities) {
			if (other.type === ENTITY_TYPE.PLAYER && other.gid !== entity.gid) {
				other.control.socket.send(sendMapRemoveEntity(entity, ...entityPets))
			}
		}

		return true

	} catch (ex) {
		console.error(`[Event.onEntityLeaveMap] id:${entity.id} "${entity.name}" leave map error:`, ex.message || ex || '[no-code]');
		return false
	}
}
