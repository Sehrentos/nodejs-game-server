/**
 * Creates a packet for opening a dialog with an NPC.
 *
 * @param {string} action - The dialog action, typically "open"|"close"|"next".
 * @param {string} gid - The NPC's global identifier.
 * @param {string} playerGid - The player's global identifier.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TDialogActionPacket - NPC dialog message structure from the client
 * @prop {"dialog"} type "dialog"
 * @prop {string} action e.g. "open", "close", "next"
 * @prop {string} gid
 * @prop {string} playerGid
 */
export function sendDialog(action, gid, playerGid) {
	return JSON.stringify({
		type: "dialog",
		action,
		gid,
		playerGid
	})
}
