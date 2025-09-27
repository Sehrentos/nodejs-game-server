import Events from "../Events.js";

/**
 * Handles NPC dialog updates received from the server.
 *
 * @param {import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendDialog.js").TDialogPacket} data - The dialog packet from the server.
 */
export function onDialog(socket, data) {
	console.log("NPC Dialog:", data); // DEBUG
	// update the UINPCDialog
	Events.emit("ui-dialog-npc-open", data);
}
