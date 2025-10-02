import { Entity } from "../../../shared/models/Entity.js"
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

	// Note: these can be removed, when client-side predictions is done
	// this is needed to also update current player position
	// if (state.playerControl != null) return // is initialized/enabled
	// const player = state.player.value
	// if (player == null) return

	// // find player in the map
	// const entity = state.map.value?.entities.find(e => e.gid === player.gid)
	// if (entity == null) return

	// // note: updating these will help with camera and map bounds,
	// // since map update is more frequent, than player update (for now).
	// player.lastX = entity.lastX
	// player.lastY = entity.lastY
}

/**
 * Called when the server sends a map entity update.
 *
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendMap.js").TMapEntityPacket} data - The map entity packet from the server.
 */
export function onUpdateMapEntity(socket, data) {
	const state = socket.state
	const entity = data.entity
	const player = state.player.value
	const map = state.map.value

	// when map entity is also the current player
	if (player instanceof Entity && player.gid === entity.gid) {
		state.player.set((props) => Object.assign(props, entity));
	}

	// update map entity
	if (map instanceof WorldMap) {
		const mapEntity = map.entities.find(e => e.gid === entity.gid)
		if (mapEntity == null) return
		// Note: does not trigger observer events,
		// since the object property is changed directly
		// and set() method is not used
		Object.assign(mapEntity, entity)
		// call the set method to trigger observer events
		state.map.set(map) // put back the changed state
	}
}

/**
 * Update entities that have received delta updates from the server
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendMap.js").TMapUpdatePacket} data - The map delta update packet from the server.
 */
export function onUpdateMapDelta(socket, data) {
	const state = socket.state
	const map = state.map.value
	const player = state.player.value

	// update map state or create new map
	if (map instanceof WorldMap) {
		// find entity in the map and update it
		for (const entityDelta of data.entities) {
			let entity = map.entities.find(e => e.gid === entityDelta.gid)
			if (entity == null) continue
			// merge entity delta data
			Object.assign(entity, entityDelta)

			// also update the current player entity props if it's in the map update
			if (player != null && player.gid === entityDelta.gid) {
				// player.lastX = entity.lastX
				// player.lastY = entity.lastY
				// player.dir = entity.dir
				// Object.assign(player, entityDelta)
				state.player.set((props) => Object.assign(props, entityDelta));
			}
		}
		// call the set method to trigger observer events
		state.map.set(map) // put back the changed state
	}
}

/**
 * Called when the server sends a new map entity.
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendMap.js").TMapNewEntityPacket} data - The map entity packet from the server.
 */
export function onNewMapEntity(socket, data) {
	const state = socket.state
	const map = state.map.value
	if (map instanceof WorldMap) {
		map.entities.push(...data.entities.map(e => new Entity(e)))
		state.map.set(map)
	}
}

/**
 * Called when the server sends a remove map entity.
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendMap.js").TMapRemoveEntityPacket} data - The map entity packet from the server.
 */
export function onRemoveMapEntity(socket, data) {
	const state = socket.state
	const entities = data.entities
	const map = state.map.value
	if (map instanceof WorldMap) {
		// remove entities
		map.entities = map.entities.filter(e => entities.some(entity => entity.gid !== e.gid))
		state.map.set(map)
	}
}
