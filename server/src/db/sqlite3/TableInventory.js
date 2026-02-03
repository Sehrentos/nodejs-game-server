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
	/** @param {import("./index.js").Database} database */
	constructor(database) {
		/** @type {import("./index.js").Database} */
		this.db = database;

		// create the database
		this.create();

		/** @type {import("better-sqlite3").Database} - get raw sqlite3 module, where wrapper does not work */
		const db = this.db.db;

		// Define the transaction for syncing inventory
		// This transaction will upsert items and remove missing ones
		this._doSync = db.transaction((_ownerId, _items) => {
			// 1. Prepare the IDs for the "Sweep" phase
			const currentItemIds = _items.map(item => item.id);

			// 2. Prepare the statements
			const upsert = db.prepare(`
				INSERT INTO inventory (_owner, id, amount, slot, is_equipped)
				VALUES (?, ?, ?, ?, ?)
				ON CONFLICT(_owner, id) DO UPDATE SET
					amount = excluded.amount,
					slot = excluded.slot,
					is_equipped = excluded.is_equipped
			`);

			const removeMissing = db.prepare(`
				DELETE FROM inventory
				WHERE _owner = ? AND id NOT IN (${currentItemIds.join(',')})
			`);

			// 3. Execute Upserts
			for (const item of _items) {
				upsert.run(_ownerId, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0);
			}

			// 4. Execute Deletions (only if there are items to keep, otherwise just clear owner)
			if (currentItemIds.length > 0) {
				return removeMissing.run(_ownerId);
			}

			return db.prepare('DELETE FROM inventory WHERE _owner = ?').run(_ownerId);
		});
	}

	/**
	 * Creates the table in the database if it doesn't already exist
	 */
	create() {
		return this.db.exec(DB_CREATE)
	}

	/**
	 * Add a new item to the player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TInventoryItem} item - The item to be added to the inventory.
	 */
	async add(owner, item) {
		return this.db.exec(
			`INSERT INTO inventory (_owner, id, amount, slot, is_equipped)
			VALUES (?, ?, ?, ?, ?)`.replace(/\t|\n/gm, ''),
			[owner, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0]
		);
	}

	/**
	 * Adds items to a player's inventory in the database.
	 *
	 * Note: This method uses UPSERT to avoid duplicates and update existing items.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TInventoryItem[]} items - The list of items to be added to the inventory.
	 */
	async put(owner, items) {
		if (items.length === 0) return Promise.resolve([]);
		return this.db.batch(
			`INSERT INTO inventory (_owner, id, amount, slot, is_equipped) VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(_owner, id) DO UPDATE SET
				amount = excluded.amount,
				slot = excluded.slot,
				is_equipped = excluded.is_equipped`,
			items.map(item => [owner, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0])
		);
		// this was added later
		// ON CONFLICT(_owner, id)
		// 	DO UPDATE SET
		// 		amount = excluded.amount,
		// 		slot = excluded.slot,
		// 		is_equipped = excluded.is_equipped;

		// const stmt = this.db.db.prepare(`INSERT INTO inventory (
		// 	_owner,
		// 	id,
		// 	amount,
		// 	slot,
		// 	is_equipped
		// ) VALUES (?, ?, ?, ?, ?)`.replace(/\t|\n/gm, ''));

		// const insertMany = this.db.db.transaction((rows) => {
		// 	for (const item of rows) {
		// 		stmt.run(owner, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0);
		// 	}
		// });

		// return insertMany(items);
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
	 * Remove multiple items from a player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TInventoryItem[]} items - The list of items to be removed from the inventory.
	 */
	async removeAll(owner, items) {
		return this.db.exec(
			`DELETE FROM inventory WHERE _owner = ? AND id IN (${items.map(item => item.id).join(", ")})`,
			[owner]
		);
	}

	/**
	 * Delete an inventory item from the database by its ID.
	 *
	 * @param {number} id - The database ID of the inventory item to delete.
	 */
	async delete(id) {
		return this.db.exec(`DELETE FROM inventory WHERE _id = ?`, [id]);
	}

	/**
	 * Clear the inventory of a specific player in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being cleared.
	 */
	async clear(owner) {
		return this.db.exec("DELETE FROM inventory WHERE _owner = ?", [owner]);
	}

	/**
	 * Drop the table, removing all associated data.
	 */
	async drop() {
		return this.db.exec(`DROP TABLE IF EXISTS inventory`)
	}

	/**
	 * Synchronize the player's inventory in the database.
	 *
	 * @param {import("../../../../shared/models/Entity.js").Entity} player - The player whose inventory is being synchronized
	 *
	 * @example
	 * this.sync(player);
	 */
	sync(player) {
		// call the actual transaction function
		return this._doSync(player.id, player.inventory);
	}
}
