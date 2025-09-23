// database class for controlling player inventory
const DB_CREATE = `CREATE TABLE IF NOT EXISTS \`inventory\` (
  \`_id\` int(11) unsigned NOT NULL auto_increment,
  \`_owner\` int(11) unsigned NOT NULL default '0',
  \`id\` int(11) unsigned NOT NULL default '0',
  \`amount\` smallint(4) unsigned NOT NULL default '0',
  \`slot\` smallint(4) unsigned NOT NULL default '0',
  \`is_equipped\` tinyint(1) unsigned NOT NULL default '0',
  PRIMARY KEY  (\`_id\`),
  KEY \`_owner\` (\`_owner\`),
  KEY \`id\` (\`id\`)
) AUTO_INCREMENT=1;`;

/**
 * @typedef {import("./Database.js").Database} TDatabase
 *
 * @typedef {Object} TTableInventoryProps
 * @prop {number} [_id] - The database ID
 * @prop {number} [_owner] - The ID of the player/entity who owns the item
 *
 * @typedef {TTableInventoryProps & import("../../../shared/models/Item.js").TItemProps} TInventoryItem
 */

export class TableInventory {
	/**
	 * @constructor
	 * @param {import("./Database.js").Database} db - The database object to use for queries
	 */
	constructor(db) {
		/** @type {import("./Database.js").Database} */
		this.db = db

		// create the database
		this.create();
	}

	/**
	 * Creates the table in the database if it doesn't already exist.
	 *
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the create query
	 */
	create() {
		return this.db.query(DB_CREATE);
	}

	/**
	 * Add a new item to the player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TInventoryItem} item - The item to be added to the inventory.
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the insert query.
	 */
	add(owner, item) {
		return this.db.query(
			"INSERT INTO inventory (_owner, id, amount, slot, is_equipped) VALUES (?, ?, ?, ?, ?)",
			[owner, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0]
		);
	}

	/**
	 * Add multiple items to a player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TInventoryItem[]} items - The list of items to be added to the inventory.
	 * @returns {Promise<import("./Database.js").TQueryResult[]>} - The result of the insert query.
	 */
	addAll(owner, items) {
		if (items.length === 0) return Promise.resolve([]);
		return this.db.batch(
			"INSERT INTO inventory (_owner, id, amount, slot, is_equipped) VALUES (?, ?, ?, ?, ?)",
			items.map(item => [owner, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0])
		);
	}

	/**
	 * Get all items from a player's inventory from the database.
	 *
	 * @param {number} owner - The player ID to get items for.
	 * @returns {Promise<TInventoryItem[]>} - The items in the player's inventory.
	 */
	async getItems(owner) {
		const rows = await this.db.query(
			"SELECT * FROM inventory WHERE _owner = ?",
			[owner]
		);
		return rows.map(row => ({
			_id: Number(row._id),
			_owner: Number(row._owner),
			id: row.id,
			amount: row.amount,
			slot: row.slot,
			isEquipped: row.is_equipped === 1,
		}))
	}

	/**
	 * Remove and items from a player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TInventoryItem[]} items - The list of items to be removed from the inventory.
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the delete query.
	 */
	removeAll(owner, items) {
		return this.db.query(
			`DELETE FROM inventory WHERE _owner = ? AND id IN (${items.map(item => item.id).join(", ")})`,
			[owner]
		);
	}

	/**
	 * Clear all items from a player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being cleared.
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the delete query.
	 */
	clear(owner) {
		return this.db.query("DELETE FROM inventory WHERE _owner = ?", [owner]);
	}

	/**
	 * Drop the table, removing all associated data.
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the drop query
	 */
	drop() {
		return this.db.query(`DROP TABLE IF EXISTS inventory`)
	}
}
