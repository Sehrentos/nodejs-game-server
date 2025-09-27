import { WorldMap } from "../../../shared/models/WorldMap.js"

/**
 * Called when the server sends a map update.
 *
 * Updates the state of the map from the server data.
 * If the map is already initialized, it will be updated.
 * If not, a new map is created.
 * Also updates player x,y position if the player is found in the map.
 *
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendMap.js").TMapPacket} data - The map packet from the server.
 */
export function onUpdateMap(socket, data) {
	const state = socket.state
	// update map state or create new map
	if (state.map.value instanceof WorldMap) {
		state.map.set((wmap) => Object.assign(wmap, data.map))
	} else {
		state.map.set(new WorldMap(data.map))
	}

	// TODO these can be removed, when client-side prediction is done (PlayerControl)
	// also update player position
	const player = state.player.value
	if (player == null) return

	const entity = state.map.value?.entities.find(e => e.gid === player.gid)
	if (entity == null) return

	// note: updating these will help with camera and map bounds,
	// since map update is more frequent, than player update (for now).
	player.lastX = entity.lastX
	player.lastY = entity.lastY
}
