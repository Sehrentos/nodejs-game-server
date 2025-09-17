import { Entity } from "../../../shared/models/Entity.js";
import { Events, State } from "../State.js";

/**
 * Handles player updates received from the server.
 *
 * Updates the player state with data received from the server.
 * If a player already exists, it merges the new data into the existing player state.
 * Otherwise, it creates a new player instance with the provided data.
 * Optionally, a custom event can be send to update the player UI.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendPlayer.js").TPlayerPacket} data - The player packet from the server.
 */
export function onUpdatePlayer(socket, data) {
	const player = data.player;
	// console.log("Player:", player);
	// update player state
	if (State.player.value instanceof Entity) {
		// Object.assign(State.player, player) // naive approach
		State.player.set((current) => {
			if (current == null) return current
			current = Object.assign({}, current, player)
			return current
		})
	} else {
		State.player.set(new Entity(player));
	}

	// update CharacterUI
	// note: no need to emit custom event, CharacterUI already subscribes to State.player
	// Events.emit("ui-character", player);

	// Note: next canvas render cycle will update the game view
}
