// database class for controlling player inventory
/* CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `item_id` int(11) unsigned NOT NULL default '0',
  `player_id` int(11) unsigned NOT NULL default '0',
  `amount` smallint(4) unsigned NOT NULL default '0',
  `slot` smallint(4) unsigned NOT NULL default '0',
  PRIMARY KEY  (`id`),
  KEY `player_id` (`player_id`),
  KEY `item_id` (`item_id`)
) AUTO_INCREMENT=1;*/
export class TableInventory {
	/**
	 * @constructor
	 * @param {import("./Database.js").Database} db - The database object to use for queries
	 */
	constructor(db) {
		/** @type {import("./Database.js").Database} */
		this.db = db
	}

	/**
	 * Add a new item to the player's inventory in the database.
	 *
	 * @param {number|BigInt|string} playerId - The ID of the player whose inventory is being updated.
	 * @param {import("../../../shared/models/Item.js").Item=} item - The item to be added to the inventory.
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the insert query.
	 */
	add(playerId, item) {
		return this.db.query(
			"INSERT INTO inventory (player_id, item_id, amount, slot) VALUES (?, ?, ?, ?)",
			[playerId, item.itemId, item.amount, item.slot]
		);
	}

	/**
	 * Add multiple items to a player's inventory in the database.
	 *
	 * @param {number|BigInt|string} playerId - The ID of the player whose inventory is being updated.
	 * @param {import("../../../shared/models/Item.js").Item[]} items - The list of items to be added to the inventory.
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the insert query.
	 */
	addAll(playerId, items) {
		return this.db.query(
			`INSERT INTO inventory (player_id, item_id, amount, slot) VALUES ${items.map(item => `(${playerId}, ${item.itemId}, ${item.amount}, ${item.slot})`)}`
		);
	}

	/**
	 * Get all items from a player's inventory from the database.
	 *
	 * @param {number|BigInt|string} playerId - The player ID to get items for.
	 * @returns {Promise<{id: number|BigInt, playerId: number, itemId: number, amount: number, slot: number}[]>} - The items in the player's inventory.
	 */
	async getItems(playerId) {
		const rows = await this.db.query(
			"SELECT * FROM inventory WHERE player_id = ?",
			[playerId]
		);
		return rows.map(row => ({
			id: row.id,
			itemId: row.item_id,
			playerId: row.player_id,
			amount: row.amount,
			slot: row.slot
		}))
	}

	/**
	 * Clear all items from a player's inventory in the database.
	 *
	 * @param {number|BigInt|string} playerId - The ID of the player whose inventory is being cleared.
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the delete query.
	 */
	clear(playerId) {
		return this.db.query("DELETE FROM inventory WHERE player_id = ?", [playerId]);
	}
}
