import { COOLDOWN_PORTAL_USE } from "../../../shared/Constants.js";
import { sendPlayer } from "./sendPlayer.js";

/**
 * Called when the player entity enters a map.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 * @param {import("../../../shared/models/WorldMap.js").WorldMap} map - The map the player is entering
 * @param {import("../../../shared/models/WorldMap.js").WorldMap} oldMap - The map the player was previously in
 */
export default async function onEntityEnterMap(entity, map, oldMap) {
	try {
		const ctrl = entity.control;

		console.log(`[Event.onEntityEnterMap] id:${entity.id} "${entity.name}" enter map: "${map.name}" from "${oldMap?.name ?? ''}"`)

		// set teleport cooldown active
		// this is good when you happen teleport to a new map but land on portal
		// e.g. chat command "/changemap 1 100 100"
		// Note: also set in the onEntityLeaveMap
		ctrl._portalUseCd.set(performance.now() + COOLDOWN_PORTAL_USE)

		// recalculate player stats
		ctrl.syncStats()

		// Note: this is also send in onTick
		// send packet to client, containing player data
		ctrl.socket.send(sendPlayer(entity))
		return true

	} catch (ex) {
		console.error(`[Event.onEntityEnterMap] id:${entity.id} "${entity.name}" enter map error:`, ex.message || ex || '[no-code]');
		return false
	}
}
