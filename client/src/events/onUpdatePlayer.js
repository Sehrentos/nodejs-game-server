import { Entity } from "../../../shared/models/Entity.js";
import { State } from "../State.js";

/**
 * Handles player updates received from the server.
 *
 * Updates the player state with data received from the server.
 * If a player already exists, it merges the new data into the existing player state.
 * Otherwise, it creates a new player instance with the provided data.
 * Optionally, a custom event can be dispatched to update the player UI.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendPlayer.js").TPlayerPacket} data - The player packet from the server.
 */
export function onUpdatePlayer(socket, data) {
	const player = data.player;
	// console.log("Player:", player);
	// update player state
	if (State.player instanceof Entity) {
		Object.assign(State.player, player) // naive approach
	} else {
		State.player = new Entity(player);
	}

	// update CharacterUI by dispatching a custom event
	document.dispatchEvent(new CustomEvent("ui-character", { detail: player }));

	// Note: next canvas render cycle will update the game view
}
