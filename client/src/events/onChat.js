/**
 * Handles chat updates received from the server.
 * Sends a custom "ui-chat" event with the chat data,
 * allowing the chat UI to update accordingly.
 *
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendChat.js").TChatPacket} data - The chat packet from the server.
 */
export function onChat(socket, data) {
	const state = socket.state
	// console.log("Chat:", data);
	// update chat state
	state.chat.set((current) => ([...current, {
		...data,
		timestamp: Date.now()
	}]))
}
