/**
 * Creates a packet containing the NPC's dialog text.
 *
 * @param {string} gid - The NPC's gid.
 * @param {string} dialog - The NPC's dialog text.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TDialogPacket - NPC dialog message structure from the server
 * @prop {"npc-dialog"} type
 * @prop {string} gid
 * @prop {string} dialog
 */
export function sendDialog(gid, dialog) {
	return JSON.stringify({
		type: "npc-dialog",
		gid,
		dialog
	})
}
