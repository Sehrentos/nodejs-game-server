const DB_CREATE = `
CREATE TABLE IF NOT EXISTS inventory (
  _id INTEGER PRIMARY KEY AUTOINCREMENT,
  _owner INTEGER NOT NULL DEFAULT 0,
  id INTEGER NOT NULL DEFAULT 0,
  amount INTEGER NOT NULL DEFAULT 0,
  slot INTEGER NOT NULL DEFAULT 0,
  isEquiped INTEGER NOT NULL DEFAULT 0,
  UNIQUE (_owner, id)
)
`;

/**
 * @typedef {Object} TInventoryTable
 * @prop {number} [_id] - The database ID
 * @prop {number} [_owner] - The ID of the player/entity who owns the item
 * @prop {number} id - The item ID
 * @prop {number} amount - The quantity of the item
 * @prop {number} slot - The inventory slot where the item is located
 * @prop {number} isEquipped - Whether the item is currently equipped
 *
 * @typedef {import("../../../shared/models/Item.js").TItemProps} TItemProps
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
	}

	/**
	 * Creates the table in the database if it doesn't already exist
	 */
	create() {
		return this.db.query('run', DB_CREATE)
	}

	/**
	 * Add a new item to the player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TItemProps} item - The item to be added to the inventory.
	 * @returns {Promise<{_id:number, _owner:number, id:number}>} - The inserted inventory item details.
	 */
	add(owner, item) {
		return this.db.query('get',
			`
			INSERT INTO inventory (
				_owner,
				id,
				amount,
				slot,
				isEquiped
			)
			VALUES (?, ?, ?, ?, ?)
			RETURNING _id, _owner, id
			`,
			[
				owner,
				item.id,
				item.amount,
				item.slot,
				item.isEquipped ? 1 : 0
			]
		);
	}

	/**
	 * Adds items to a player's inventory in the database.
	 *
	 * Note: This method uses UPSERT to avoid duplicates and update existing items.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TItemProps[]} items - The list of items to be added to the inventory.
	 * @returns {Promise<import("./index.js").TSQLResult>}
	 */
	put(owner, items) {
		if (items.length === 0) return Promise.resolve({ changes: 0, lastInsertRowid: 0 });
		return this.db.query('run',
			`
			INSERT INTO inventory (
				_owner,
				id,
				amount,
				slot,
				isEquiped
			)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(_owner, id) DO UPDATE SET
				amount = excluded.amount,
				slot = excluded.slot,
				isEquiped = excluded.isEquiped
			`,
			items.map(item => [
				owner,
				item.id,
				item.amount,
				item.slot,
				item.isEquipped ? 1 : 0
			])
		);
	}

	/**
	 * Get all items from a player's inventory from the database.
	 *
	 * @param {number} owner - The player ID to get items for.
	 * @returns {Promise<Array<TItemProps>>} - The items in the player's inventory.
	 */
	async getAll(owner) {
		/** @type {Array<TInventoryTable>} */
		const items = await this.db.all(
			`
			SELECT * FROM inventory
			WHERE _owner = ?
			`,
			[owner]
		);

		return items.map(row => ({
			_id: Number(row._id),
			_owner: Number(row._owner),
			id: Number(row.id),
			amount: Number(row.amount),
			slot: Number(row.slot),
			isEquipped: row.isEquipped === 1,
		}))
	}

	/**
	 * Remove multiple items from a player's inventory in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being updated.
	 * @param {TItemProps[]} items - The list of items to be removed from the inventory.
	 * @returns {Promise<import("./index.js").TSQLResult>}
	 */
	removeAll(owner, items) {
		const itemIds = items.map(item => item.id).join(", ");
		return this.db.query('run',
			`
			DELETE FROM inventory
			WHERE _owner = ?
			AND id IN (${itemIds})
			`,
			[owner]
		);
	}

	/**
	 * Delete an inventory item from the database by its ID.
	 *
	 * @param {number} id - The database ID of the inventory item to delete.
	 * @returns {Promise<import("./index.js").TSQLResult>}
	 */
	delete(id) {
		return this.db.query('run',
			`
			DELETE FROM inventory
			WHERE _id = ?
			`,
			[id]
		);
	}

	/**
	 * Clear the inventory of a specific player in the database.
	 *
	 * @param {number} owner - The ID of the player whose inventory is being cleared.
	 * @returns {Promise<import("./index.js").TSQLResult>}
	 */
	clear(owner) {
		return this.db.query('run',
			`
			DELETE FROM inventory
			WHERE _owner = ?
			`,
			[owner]
		);
	}

	/**
	 * Drop the table, removing all associated data.
	 * @returns {Promise<import("./index.js").TSQLResult>}
	 */
	drop() {
		return this.db.query('run',
			`
			DROP TABLE IF EXISTS inventory
			`
		)
	}

	/**
	 * Synchronize the player's inventory in the database.
	 *
	 * @param {import("../../../shared/models/Entity.js").Entity} player - The player whose inventory is being synchronized
	 * @returns {Promise<import("./index.js").TSQLResult>}
	 */
	async sync(player) {
		// 1. Prepare the IDs for the "Sweep" phase
		const currentItemIds = player.inventory.map(item => item.id);

		if (currentItemIds.length > 0) {
			// 2. Execute Upserts for all items
			await this.db.query('run',
				`
				INSERT INTO inventory (
					_owner,
					id,
					amount,
					slot,
					isEquiped
				)
				VALUES (?, ?, ?, ?, ?)
				ON CONFLICT(_owner, id) DO UPDATE SET
					amount = excluded.amount,
					slot = excluded.slot,
					isEquiped = excluded.isEquiped
				`,
				player.inventory.map(item => [
					player.id,
					item.id,
					item.amount,
					item.slot,
					item.isEquipped ? 1 : 0
				])
			);

			// 3. Execute Deletions (only if there are items to keep, otherwise just clear owner)
			return this.db.query('run',
				`
				DELETE FROM inventory
				WHERE _owner = ?
				AND id NOT IN (${currentItemIds.join(',')})
				`,
				[player.id]
			);
		}

		// If no items to keep, clear all
		return this.db.query('run',
			`
			DELETE FROM inventory WHERE _owner = ?
			`,
			[player.id]
		);
	}
}
