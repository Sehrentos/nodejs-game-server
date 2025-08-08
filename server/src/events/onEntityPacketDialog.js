import { getItemByItemId, ITEMS } from '../../../shared/data/ITEMS.js';
import { sendItemsSold } from './sendItemsSold.js';

const TAG = '[Event.onEntityPacketDialog]';

/**
 * Handles the NPC interaction dialog packets received from the server. These are sent by the client.
 * - Player started interacting with the NPC.
 * - Player next article.
 * - Player stopped interacting with the NPC.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 * @param {import("../../../client/src/events/sendDialog.js").TDialogActionPacket} data - The dialog packet from the client.
 * @param {number} timestamp - The current timestamp or performance.now().
 */
export default async function onEntityPacketDialog(entity, data, timestamp) {
	try {
		const ctrl = entity.control

		switch (data.action) {
			case 'open':
				console.log(`${TAG} "${entity.name}" started interacting with NPC (gid: ${data.gid})`)
				ctrl.isMovementBlocked = true
				break;

			case 'next':
				console.log(`${TAG} "${entity.name}" next article (gid: ${data.gid})`)
				break;

			case 'close':
				console.log(`${TAG} "${entity.name}" stopped interacting with NPC (gid: ${data.gid})`)
				ctrl.isMovementBlocked = false
				break;

			case 'accept-sell-all':
				console.log(`${TAG} "${entity.name}" accepted to sell all items dialog (gid: ${data.gid})`)
				ctrl.isMovementBlocked = false
				await sellAllItems(entity)
				break;

			default:
				console.log(`${TAG} unknown action: ${data.action}`)
				break;
		}
	} catch (ex) {
		console.error(`${TAG} ${entity.gid} error:`, ex.message || ex || '[no-code]');
	}
}

/**
 * Called when the player accepts to sell all items dialog
 *
 * TODO only sell selected items from inventory
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 */
async function sellAllItems(entity) {
	console.log(`${TAG} "${entity.name}" sold all items (gid: ${entity.gid})`)
	if (entity.inventory.length === 0) return
	let totalSellPrice = 0
	let totalSellAmount = 0

	for (const item of entity.inventory) {
		let meta = getItemByItemId(item.itemId)
		if (meta === undefined) continue
		let sellPrice = meta.sell
		totalSellPrice += sellPrice
		totalSellAmount += item.amount
		entity.money += sellPrice
	}
	entity.inventory = []

	// update the db
	await entity.control.world.db.inventory.clear(entity.id)

	// update the client
	entity.control.socket.send(sendItemsSold(totalSellPrice, totalSellAmount))
}
