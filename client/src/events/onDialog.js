/**
 * Handles NPC dialog updates received from the server.
 *
 * @param {WebSocket|import("../control/SocketControl.js").default} socket - The WebSocket connection.
 * @param {import("../../../server/src/events/sendDialog.js").TDialogPacket} data - The dialog packet from the server.
 */
export function onDialog(socket, data) {
	console.log("NPC Dialog:", data); // DEBUG
	// update the UINPCDialog
	document.dispatchEvent(new CustomEvent("ui-npc-dialog", {
		detail: {
			gid: data.gid,
			content: data.dialog,
			isVisible: true
		}
	}));
}
