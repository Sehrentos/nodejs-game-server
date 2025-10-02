import { getItemByItemId } from '../../../shared/data/ITEMS.js';
import { sendItemsSold } from '../events/sendItemsSold.js';
import { sendPlayer } from './sendPlayer.js';

const TAG = '[Event.onEntityPacketDialog]';

/**
 * Handles the NPC interaction dialog packets received from the client.
 * - Player started interacting with the NPC.
 * - Player slected "next" article etc.
 * - Player stopped interacting with the NPC.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 * @param {import("../../../client/src/events/sendDialog.js").TDialogActionPacket} data - The dialog packet from the client.
 * @param {number} timestamp - The current timestamp or performance.now().
 */
export default async function onEntityPacketDialog(entity, data, timestamp) {
	try {
		// const ctrl = entity.control
		switch (data.action) {
			case 'open':
				console.log(`${TAG} "${entity.name}" started interacting with NPC (gid: ${data.gid})`)
				entity.isMoveable = false
				break;

			case 'next':
				console.log(`${TAG} "${entity.name}" next article (gid: ${data.gid})`)
				break;

			case 'close':
				console.log(`${TAG} "${entity.name}" stopped interacting with NPC (gid: ${data.gid})`)
				entity.isMoveable = true
				break;

			case 'sell':
				console.log(`${TAG} "${entity.name}" wants to sell items (gid: ${data.gid})`, data.data?.sellItems)
				await sellSelectedItems(entity, data.data.sellItems)
				break;

			case 'accept-sell-all':
				console.log(`${TAG} "${entity.name}" accepted to sell all items (gid: ${data.gid})`)
				await sellAllItems(entity)
				break;

			default:
				console.log(`${TAG} unknown action: ${data.action}`, data)
				break;
		}
	} catch (ex) {
		console.error(`${TAG} ${entity.gid} error:`, ex.message || ex || '[no-code]');
	}
}

/**
 * Sells the selected items from the entity's inventory.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 * @param {{id: number, amount: number}[]} sellItems
 */
async function sellSelectedItems(entity, sellItems) {
	let totalSellPrice = 0
	let totalSellAmount = 0

	// unblock movement in case it wasn't already
	// await user to select close in the dialog
	// entity.isMoveable = true

	for (const item of sellItems) {
		// validate item exists
		let itemData = getItemByItemId(item.id)
		if (!itemData) {
			console.log(`${TAG} "${entity.name}" tried to sell unknown item (gid: ${entity.gid}) id: ${item.id}`)
			return
		}
		// validate entity has the item in the inventory
		// and has the right amounts of it
		if (!entity.inventory.some(itm => itm.id === item.id && itm.amount >= item.amount)) {
			console.log(`${TAG} "${entity.name}" tried to sell item with wrong amount or not in inventory (gid: ${entity.gid}) id: ${item.id}`)
			return
		}
		totalSellPrice += itemData.sell * item.amount
		totalSellAmount += item.amount
	}

	// remove the items from the inventory or change amount
	for (const item of sellItems) {
		const itemIndex = entity.inventory.findIndex(itm => itm.id === item.id)
		if (itemIndex === -1) continue
		if (entity.inventory[itemIndex].amount === item.amount) {
			entity.inventory.splice(itemIndex, 1)
		} else {
			entity.inventory[itemIndex].amount -= item.amount
		}
	}

	// cleanup items with amount of 0
	entity.inventory = entity.inventory.filter(itm => itm.amount > 0)

	// exchange money
	entity.money += totalSellPrice

	entity.control.socket.send(sendItemsSold(totalSellPrice, totalSellAmount))
	entity.control.socket.send(sendPlayer(entity, "money", "inventory"))
	console.log(`${TAG} "${entity.name}" sold (${totalSellPrice}z, ${totalSellAmount}) items (gid: ${entity.gid})`)
}

/**
 * Sells all sellable items from the entity's inventory.
 *
 * Note: Only items that have a sell price and are not equipped will be sold.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 */
async function sellAllItems(entity) {
	let totalSellPrice = 0
	let totalSellAmount = 0

	// unblock movement in case it wasn't already
	entity.isMoveable = true

	// get all sellable items
	const items = entity.inventory.filter(item => {
		// only sell items that have a sell price
		if (item.sell <= 0) return false
		// only sell unequipped items
		if (item.isEquipped) return false
		return true
	})

	if (items.length === 0) {
		entity.control.socket.send(sendItemsSold(totalSellPrice, totalSellAmount))
		return
	}

	for (const item of items) {
		let meta = getItemByItemId(item.id)
		if (meta === undefined) continue
		let sellPrice = meta.sell
		totalSellPrice += sellPrice
		totalSellAmount += item.amount
	}

	// remove the items from the inventory
	entity.inventory = entity.inventory.filter(invItem => {
		return !items.find(sellItem => sellItem._id === invItem._id)
	})
	// exchange money
	entity.money += totalSellPrice

	// update the client
	entity.control.socket.send(sendItemsSold(totalSellPrice, totalSellAmount))
	entity.control.socket.send(sendPlayer(entity, "money", "inventory"))

	console.log(`${TAG} "${entity.name}" sold all items (gid: ${entity.gid})`)
}
