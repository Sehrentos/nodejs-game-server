import { State } from "../State.js";

/**
 * Handles NPC dialog updates received from the server.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendDialog.js").TDialogPacket} data - The dialog packet from the server.
 */
export function onDialog(socket, data) {
	console.log("NPC Dialog:", data); // DEBUG
	// update the UINPCDialog
	State.events.emit("ui-dialog-npc-open", data);
}
