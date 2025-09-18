import { State } from "../State.js";

/**
 * Handles chat updates received from the server.
 * Sends a custom "ui-chat" event with the chat data,
 * allowing the chat UI to update accordingly.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendChat.js").TChatPacket} data - The chat packet from the server.
 */
export function onChat(socket, data) {
	// console.log("Chat:", data);
	// update chat state
	State.chat.set((current) => ([...current, {
		...data,
		timestamp: Date.now()
	}]))
}
