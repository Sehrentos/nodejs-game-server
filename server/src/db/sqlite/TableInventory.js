const DB_CREATE = `CREATE TABLE IF NOT EXISTS inventory (
  _id INTEGER PRIMARY KEY AUTOINCREMENT,
  _owner INTEGER NOT NULL DEFAULT 0,
  id INTEGER NOT NULL DEFAULT 0,
  amount INTEGER NOT NULL DEFAULT 0,
  slot INTEGER NOT NULL DEFAULT 0,
  is_equipped INTEGER NOT NULL DEFAULT 0,
  UNIQUE (_owner, id)
);`.replace(/\s{2}|\n/gm, '');

/**
 * @typedef {Object} TTableInventoryProps
 * @prop {number} [_id] - The database ID
 * @prop {number} [_owner] - The ID of the player/entity who owns the item
 * @typedef {TTableInventoryProps & import("../../../../shared/models/Item.js").TItemProps} TInventoryItem
 */

/**
 * @module TableInventory
 * This class manages inventory-related database operations.
 */
export class TableInventory {
	/** @param {import("./Database.js").Database} database */
	constructor(database) {
		/** @type {import("./Database.js").Database} */
		this.db = database;

		// create the database
		this.create();
	}

	/**
	 * Creates the table in the database if it doesn't already exist
	 */
	create() {
		return this.db.db.exec(DB_CREATE)
	}

	/**
	 * Add a new item to the player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TInventoryItem} item - The item to be added to the inventory.
	 */
	async add(owner, item) {
		return this.db.query(
			`INSERT INTO inventory (_owner, id, amount, slot, is_equipped)
			VALUES (?, ?, ?, ?, ?)`.replace(/\t|\n/gm, ''),
			[owner, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0]
		);
	}

	/**
	 * Add multiple items to a player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TInventoryItem[]} items - The list of items to be added to the inventory.
	 */
	async addAll(owner, items) {
		if (items.length === 0) return Promise.resolve([]);
		// return this.db.batch(
		// 	"INSERT INTO inventory (_owner, id, amount, slot, is_equipped) VALUES (?, ?, ?, ?, ?)",
		// 	items.map(item => [owner, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0])
		// );
		const stmt = this.db.db.prepare(`INSERT INTO inventory (
			_owner,
			id,
			amount,
			slot,
			is_equipped
		) VALUES (?, ?, ?, ?, ?)`.replace(/\t|\n/gm, ''));

		const insertMany = this.db.db.transaction((rows) => {
			for (const item of rows) {
				stmt.run(owner, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0);
			}
		});

		return insertMany(items);
	}

	/**
	 * Get all items from a player's inventory from the database.
	 *
	 * @param {number} owner - The player ID to get items for.
	 * @returns {Promise<TInventoryItem[]>} - The items in the player's inventory.
	 */
	async getItems(owner) {
		const stmt = this.db.db.prepare(
			"SELECT * FROM inventory WHERE _owner = ?",
		);

		/** @type {any[]} */
		const rows = stmt.all(owner)

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
	 */
	async removeAll(owner, items) {
		return this.db.query(
			`DELETE FROM inventory WHERE _owner = ? AND id IN (${items.map(item => item.id).join(", ")})`,
			[owner]
		);
	}

	/**
	 * Clear all items from a player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being cleared.
	 */
	async clear(owner) {
		return this.db.query("DELETE FROM inventory WHERE _owner = ?", [owner]);
	}

	/**
	 * Drop the table, removing all associated data.
	 */
	async drop() {
		return this.db.query(`DROP TABLE IF EXISTS inventory`)
	}
}
