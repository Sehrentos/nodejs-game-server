import { WorldMap } from "../../../shared/models/WorldMap.js"
import { State } from "../State.js"

/**
 * Called when the server sends a map update.
 *
 * Updates the state of the map from the server data.
 * If the map is already initialized, it will be updated.
 * If not, a new map is created.
 * Also updates player x,y position if the player is found in the map.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendMap.js").TMapPacket} data - The map packet from the server.
 */
export function onUpdateMap(socket, data) {
	const map = data.map;
	// update map state or create new map
	if (State.map instanceof WorldMap) {
		Object.assign(State.map, map) // naive approach
	} else {
		State.map = new WorldMap(map)
	}

	// also update player position
	const player = State.player
	if (player == null) return

	const entity = State.map.entities.find(e => e.gid === player.gid)
	if (entity == null) return

	// note: updating these will help with camera and map bounds,
	// since map update is more frequent, than player update (for now).
	player.lastX = entity.lastX
	player.lastY = entity.lastY

	// Note: next render cycle will update the game view
}
