import { Entity } from "../../../shared/models/Entity.js";

/**
 * Handles player update received from the server.
 *
 * Updates the player state with data received from the server.
 * If a player already exists, it merges the new data into the existing player state.
 * Otherwise, it creates a new player instance with the provided data.
 *
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendPlayer.js").TPlayerPacket} data - The player packet from the server.
 */
export function onUpdatePlayer(socket, data) {
	const state = socket.state
	// update player state or merge existing data
	if (state.player.value instanceof Entity) {
		state.player.set((player) => Object.assign(player, data.player));
		return
	}
	// instantiate the player entity
	state.player.set(new Entity(data.player));
}
