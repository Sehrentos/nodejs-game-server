/**
 * Creates a packet for opening a dialog with an NPC.
 *
 * @param {string} action - The dialog action, typically "open"|"close"|"next".
 * @param {string} gid - The NPC's global identifier.
 * @param {string} playerGid - The player's global identifier.
 * @param {TDialogActionData} [data] - Optional data associated with the dialog action.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TDialogActionPacket - NPC dialog message structure from the client
 * @prop {"dialog"} type "dialog"
 * @prop {string} action e.g. "open", "close", "next"
 * @prop {string} gid
 * @prop {string} playerGid
 * @prop {TDialogActionData} [data] - Optional data associated with the dialog action.
 *
 * @typedef {Object} TDialogActionData
 * @prop {{id: number, amount: number}[]} sellItems - selected items and amounts to sell
 */
export function sendDialog(action, gid, playerGid, data) {
	return JSON.stringify({
		type: "dialog",
		action,
		gid,
		playerGid,
		data,
	})
}
