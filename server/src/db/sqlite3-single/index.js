import 'dotenv/config';
import crypto from 'node:crypto';
import SQLiteDatabase from 'better-sqlite3';
import { Account } from "../../../../shared/models/Account.js";

const DB_SALT = process.env.DB_SALT || 'your_unique_salt';

const DB_CREATE_ACCOUNT = `CREATE TABLE IF NOT EXISTS account (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	email TEXT NOT NULL,
	state INTEGER NOT NULL DEFAULT 0,
	expires INTEGER NOT NULL DEFAULT 0,
	logincount INTEGER NOT NULL DEFAULT 0,
	lastlogin TEXT,
	last_ip TEXT NOT NULL DEFAULT '',
	auth_token TEXT UNIQUE
)`

const DB_CREATE_INVENTORY = `CREATE TABLE IF NOT EXISTS inventory (
	_id INTEGER PRIMARY KEY AUTOINCREMENT,
	_owner INTEGER NOT NULL DEFAULT 0,
	id INTEGER NOT NULL DEFAULT 0,
	amount INTEGER NOT NULL DEFAULT 0,
	slot INTEGER NOT NULL DEFAULT 0,
	is_equipped INTEGER NOT NULL DEFAULT 0,
	UNIQUE (_owner, id)
)`;

const DB_CREATE_PLAYER = `CREATE TABLE IF NOT EXISTS player (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	account_id INTEGER NOT NULL DEFAULT 0,
	sprite_id INTEGER NOT NULL DEFAULT 0,
	name TEXT NOT NULL UNIQUE DEFAULT '',
	base_level INTEGER NOT NULL DEFAULT 1,
	base_exp INTEGER NOT NULL DEFAULT 0,
	job INTEGER NOT NULL DEFAULT 0,
	job_level INTEGER NOT NULL DEFAULT 1,
	job_exp INTEGER NOT NULL DEFAULT 0,
	money INTEGER NOT NULL DEFAULT 0,
	str INTEGER NOT NULL DEFAULT 0,
	agi INTEGER NOT NULL DEFAULT 0,
	vit INTEGER NOT NULL DEFAULT 0,
	int INTEGER NOT NULL DEFAULT 0,
	dex INTEGER NOT NULL DEFAULT 0,
	luk INTEGER NOT NULL DEFAULT 0,
	hp INTEGER NOT NULL DEFAULT 0,
	hp_max INTEGER NOT NULL DEFAULT 0,
	mp INTEGER NOT NULL DEFAULT 0,
	mp_max INTEGER NOT NULL DEFAULT 0,
	party_id INTEGER NOT NULL DEFAULT 0,
	last_map INTEGER NOT NULL DEFAULT 0,
	last_x INTEGER NOT NULL DEFAULT 0,
	last_y INTEGER NOT NULL DEFAULT 0,
	save_map INTEGER NOT NULL DEFAULT 0,
	save_x INTEGER NOT NULL DEFAULT 0,
	save_y INTEGER NOT NULL DEFAULT 0,
	sex INTEGER NOT NULL DEFAULT 0,
	last_login TEXT DEFAULT NULL
)`

export const database = new SQLiteDatabase(process.env.SQLITE_FILE || './database.sqlite', {
	readonly: false,
	verbose: console.log,
});
database.pragma('journal_mode = WAL');

// create tables if not exists
const stmts = [DB_CREATE_ACCOUNT, DB_CREATE_INVENTORY, DB_CREATE_PLAYER];
for (const sql of stmts) {
	database.exec(sql);
}

export default database;

// #region utils

/**
 * Execute a SQL command with optional parameters.
 *
 * Use for INSERT/UPDATE/DELETE/DROP statements.
 *
 * @param {*} sql
 * @param {*} params
 * @returns {Promise<{ affectedRows: number, insertId: number|bigint }>}
 */
export const exec = async (sql, params = []) => {
	const stmt = database.prepare(sql);
	const r = stmt.run(...params);
	return { affectedRows: r.changes, insertId: r.lastInsertRowid };
}

// /**
//  * Transaction wrapper.
//  *
//  * Use for multiple statements.
//  *
//  * @param {*} fn
//  * @param  {...any} params
//  * @returns
//  */
// export const transaction = async (fn, ...params) => {
// 	const t = database.transaction(fn);
// 	return t(...params);
// }

/**
 * Execute a SQL query with optional parameters and returns the result.
 *
 * If the query is a SELECT, PRAGMA, SHOW, DESC, or DESCRIBE, returns all rows from the result.
 * Otherwise, returns the affected row count and the last inserted row ID.
 *
 * @param {string} sql - The SQL query to execute
 * @param {any[]} [params] - Optional parameters to pass to the query
 * @returns {Promise<any[]>} - The result of the query
 */
export const query = async (sql, params = []) => {
	const stmt = database.prepare(sql);
	return stmt.all(...params);
}

/**
 * Executes a batch of SQL queries with optional parameters and returns all rows from the result.
 *
 * @param {string} sql - The SQL query to execute
 * @param {any[][]} [paramsArray] - Optional parameters to pass to the query, an array of arrays
 * @returns {Promise<*>} - The result of the query
 */
export const batch = async (sql, paramsArray = []) => {
	const stmt = database.prepare(sql);
	const insertMany = database.transaction((rows) => {
		for (const params of rows) {
			stmt.run(...params);
		}
	});
	return insertMany(paramsArray);
}

// #endregion

// #region Account
/**
 * Adds a new account to the database.
 *
 * @param {import("../../../../shared/models/Account.js").TAccount=} account
 * @returns
 */
export const addAccount = async (account) => {
	// SHA2(CONCAT(account.password, SALT), 512); // password hashing
	const hash = crypto.createHash('sha512');
	hash.update(account.password + DB_SALT);
	const hashedPassword = hash.digest('hex'); // base64,hex

	return exec(`
	INSERT INTO account (
		username,
		password,
		email,
		state,
		expires,
		logincount,
		lastlogin,
		last_ip,
		auth_token
	)
	VALUES (
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?
	)
	`,
		[
			account.username,
			hashedPassword,
			account.email,
			account.state,
			account.expires,
			account.logincount,
			account.lastlogin.toISOString(),
			account.last_ip,
			account.auth_token
		]
	)
}

/**
 * Update the authentication token for the given account ID.
 *
 * @param {string|number|bigint} id - The Account ID
 * @param {string} token - The new authentication token
 */
export const updateAccountToken = async (id, token) => {
	return exec(`UPDATE account SET auth_token = ? WHERE id = ?`,
		[token, id]
	)
}

/**
 * Login attempt using the given username and password.
 *
 * @param {string} username - The username to validate
 * @param {string} password - The password to validate
 * @param {string=} last_ip - The last IP of the user. optional
 * @returns {Promise<Account>} - The account object if the login is valid
 */
export const loginToAccount = async (username, password, last_ip) => {
	// SHA2(CONCAT(?, '${SALT}'), 512)
	const hash = crypto.createHash('sha512');
	hash.update(password + DB_SALT);
	const hashedPassword = hash.digest('hex'); // base64,hex

	const stmtAccounts = database.prepare(
		`SELECT * FROM account WHERE username = ? AND password = ? LIMIT 1`
	);

	/**
	 * @type {Array<any>}
	 */
	const accountRows = stmtAccounts.all([username, hashedPassword]);
	if (accountRows.length === 0) {
		throw Error('Invalid login credentials')
	}

	// check if account is already logged in
	// if (accountRows[0].state === 1) {
	//     throw Error('Account already logged in')
	// }

	database.prepare(
		`UPDATE account SET state = 1, logincount = logincount + 1, lastlogin = ?, last_ip = ? WHERE id = ?`,
	).run([
		new Date().toISOString(),
		last_ip || "",
		accountRows[0].id
	])

	return new Account(accountRows[0])
}

/**
 * Login attempt using the given token.
 *
 * @param {string} token - The token to validate
 * @returns {Promise<Account>} - The account object if the token is valid
 */
export const loginToAccountWithToken = async (token) => {
	const stmtAccounts = database.prepare(
		`SELECT * FROM account WHERE auth_token = ? LIMIT 1`
	)
	/**
	 * @type {Array<any>}
	 */
	const accountRows = stmtAccounts.all([token]);

	if (accountRows.length === 0) {
		throw Error('Invalid login token')
	}

	database.prepare(
		`UPDATE account SET state = 1, logincount = logincount + 1, lastlogin = ? WHERE id = ?`
	).run([new Date().toISOString(), accountRows[0].id])

	return new Account(accountRows[0])
}

/**
 * Logout an account by setting the state to 0 and optionally removing the token
 *
 * @param {string|number|bigint} id - The Account ID
 * @param {boolean} clearToken - Whether to clear the token
 */
export const logoutFromAccount = async (id, clearToken = true) => {
	const stmt = database.prepare(
		clearToken
			? `UPDATE account SET state = 0, auth_token = NULL WHERE id = ?`
			: `UPDATE account SET state = 0 WHERE id = ?`)

	return stmt.run([id])
}

/**
 * Logs out all accounts by setting their state to 0 and clearing their authentication tokens.
 * This method updates the entire account table, effectively logging out all users.
 *
 * @param {boolean} clearToken - Whether to clear the token
 */
export const logoutAllAccounts = async (clearToken = true) => {
	const stmt = database.prepare(
		clearToken
			? `UPDATE account SET state = 0, auth_token = NULL WHERE state = 1`
			: `UPDATE account SET state = 0 WHERE state = 1`)

	return stmt.run();
}

/**
 * Remove an account
 * @param {string|number|bigint} id - The Account ID
 */
export const deleteAccount = async (id) => {
	return database.prepare(`DELETE FROM account WHERE id = ?`).run([id])
}

/**
 * Drop the table, removing all associated data
 */
export const dropAccountTable = async () => {
	return database.prepare(`DROP TABLE IF EXISTS account`).run()
}

// #endregion Account


// #region Inventory
/**
 * @typedef {Object} TTableInventoryProps
 * @prop {number} [_id] - The database ID
 * @prop {number} [_owner] - The ID of the player/entity who owns the item
 * @typedef {TTableInventoryProps & import("../../../../shared/models/Item.js").TItemProps} TInventoryItem
 */

/**
 * Add a new item to the player's inventory in the database.
 *
 * @param {number} owner - The ID of the player whose inventory is being updated.
 * @param {TInventoryItem} item - The item to be added to the inventory.
 */
export const addInventory = async (owner, item) => exec(
	`INSERT INTO inventory (_owner, id, amount, slot, is_equipped)
			VALUES (?, ?, ?, ?, ?)`.replace(/\t|\n/gm, ''),
	[owner, item.id, item.amount, item.slot, item.isEquipped ? 1 : 0]
);

/**
 * Adds items to a player's inventory in the database.
 *
 * Note: This method uses UPSERT to avoid duplicates and update existing items.
 *
 * @param {number} owner - The ID of the player whose inventory is being updated.
 * @param {TInventoryItem[]} items - The list of items to be added to the inventory.
 */
export const putInventory = async (owner, items) => {
	if (items.length === 0) return Promise.resolve([]);
	return batch(
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
export const getInventory = async (owner) => {
	/**
	 * @type {Array<any>}
	 */
	const rows = database.prepare(
		`SELECT * FROM inventory WHERE _owner = ?`
	).all([owner])

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
export const removeInventoryItems = (owner, items) => exec(
	`DELETE FROM inventory WHERE _owner = ? AND id IN (${items.map(item => item.id).join(", ")})`,
	[owner]
);

/**
 * Delete an inventory item from the database by its ID.
 *
 * @param {number} id - The database ID of the inventory item to delete.
 */
export const deleteInventoryItem = (id) => exec(
	`DELETE FROM inventory WHERE _id = ?`,
	[id]
);

/**
 * Clear the inventory of a specific player in the database.
 *
 * @param {number} owner - The ID of the player whose inventory is being cleared.
 */
export const clearInventory = (owner) => exec("DELETE FROM inventory WHERE _owner = ?", [owner]);

/**
 * Drop the table, removing all associated data.
 */
export const dropInventoryTable = () => exec(`DROP TABLE IF EXISTS inventory`)

/**
 * Synchronize the player's inventory in the database.
 *
 * @param {import("../../../../shared/models/Entity.js").Entity} player - The player whose inventory is being synchronized
 *
 * @example
 * this.sync(player);
 */
export const syncInventory = (player) => doInventorySync(player.id, player.inventory);

/**
 * Synchronize the player's inventory in the database.
 *
 * @param {number} _ownerId - The ID of the player whose inventory is being synchronized
 * @param {any[]} _items - The list of items to be synchronized
 */
const doInventorySync = database.transaction((_ownerId, _items) => {
	// 1. Prepare the IDs for the "Sweep" phase
	const currentItemIds = _items.map(item => item.id);

	// 2. Prepare the statements
	const upsert = database.prepare(`
		INSERT INTO inventory (_owner, id, amount, slot, is_equipped)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(_owner, id) DO UPDATE SET
			amount = excluded.amount,
			slot = excluded.slot,
			is_equipped = excluded.is_equipped
	`);

	const removeMissing = database.prepare(`
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

	return database.prepare('DELETE FROM inventory WHERE _owner = ?').run(_ownerId);
});
// #endregion Inventory


// #region Player
/**
 * Add a new player to the database.
 *
 * @param {import("../../../../shared/models/Entity.js").TEntityProps=} player
 */
export const addPlayer = (player) => {
	// map player object to database columns
	const params = {
		// aid string can be number or bigint in the database
		account_id: player.aid,
		sprite_id: player.spriteId,
		name: player.name,
		base_level: player.level,
		job_level: player.jobLevel,
		base_exp: player.baseExp,
		job_exp: player.jobExp,
		job: player.job,
		sex: player.sex,
		money: player.money,
		str: player.str,
		agi: player.agi,
		vit: player.vit,
		int: player.int,
		dex: player.dex,
		luk: player.luk,
		hp: player.hp,
		hp_max: player.hpMax,
		mp: player.mp,
		mp_max: player.mpMax,
		last_map: player.lastMap,
		last_x: player.lastX,
		last_y: player.lastY,
		save_map: player.saveMap,
		save_x: player.saveX,
		save_y: player.saveY,
		// last_login: player.lastLogin,
	}
	const names = Object.keys(params).map((v) => '`' + v + '`').join(',')
	const values = Object.values(params)
	return exec(
		`INSERT INTO player (${names}, last_login) VALUES (${values.map(() => '?').join(',')}, ?)`,
		[...values, new Date().toISOString()]
	)
}

/**
 * Update a player in the database.
 *
 * @param {import("../../../../shared/models/Entity.js").TEntityProps=} player
 */
export const syncPlayer = (player) => {
	// map player object to database columns
	const params = {
		sprite_id: player.spriteId,
		name: player.name,
		base_level: player.level,
		job_level: player.jobLevel,
		base_exp: player.baseExp,
		job_exp: player.jobExp,
		job: player.job,
		sex: player.sex,
		money: player.money,
		str: player.str,
		agi: player.agi,
		vit: player.vit,
		int: player.int,
		dex: player.dex,
		luk: player.luk,
		hp: player.hp,
		hp_max: player.hpMax,
		mp: player.mp,
		mp_max: player.mpMax,
		last_map: player.lastMap,
		last_x: player.lastX,
		last_y: player.lastY,
		save_map: player.saveMap,
		save_x: player.saveX,
		save_y: player.saveY,
		// last_login: player.lastLogin,
	}
	// to `name`=? pairs
	const names = Object.keys(params).map((v) => '`' + v + '`=?').join(',')
	const values = Object.values(params)
	return exec(
		`UPDATE player SET ${names}, last_login = ? WHERE id=?`,
		[...values, new Date().toISOString(), player.id]
	)
}

/**
 * Get players by their Account ID.
 * @param {number} aid
 * @returns {Promise<import("../../../../shared/models/Entity.js").TEntityProps[]>}
 */
export const getByAccountId = async (aid) => {
	/**
	 * @type {Array<any>}
	 */
	const rows = database.prepare(
		`SELECT * FROM player WHERE account_id = ?`
	).all([aid])

	return rows.map(row => {
		/** @type {import("../../../../shared/models/Entity.js").TEntityProps} */
		let props = {
			// Note: id | account_id can be number or bigint (MariaDB INTEGER auto_increment)
			id: Number(row.id),
			aid: Number(row.account_id),
			spriteId: Number(row.sprite_id),
			name: row.name,
			level: row.base_level,
			jobLevel: row.job_level,
			baseExp: row.base_exp,
			jobExp: row.job_exp,
			job: row.job,
			sex: row.sex,
			money: row.money,
			str: row.str,
			agi: row.agi,
			vit: row.vit,
			int: row.int,
			dex: row.dex,
			luk: row.luk,
			hp: row.hp,
			hpMax: row.hp_max,
			mp: row.mp,
			mpMax: row.mp_max,
			lastMap: row.last_map,
			lastX: row.last_x,
			lastY: row.last_y,
			saveMap: row.save_map,
			saveX: row.save_x,
			saveY: row.save_y,
			lastLogin: row.last_login,
		}
		return props
	})
}

/**
 * Get total palyers.
 * @returns {Promise<number>}
 */
export const countPlayer = async () => {
	const rows = database.prepare(`SELECT COUNT(*) as count FROM player`).run() //=[{count: 2}]
	return rows[0]?.count || 0
}

/**
 * Set player name. Trim name to 30 chars if too long.
 * @param {number} id
 * @param {string} name
 */
export const updatePlayerName = (id, name) => {
	// trim name to 30, if too long
	if (name.length > 30) name = name.slice(0, 30)
	return exec(`UPDATE player SET name=? WHERE id=?`, [name, id])
}

/**
 * Delete an item by its database ID.
 *
 * @param {number} id - The database ID of the inventory item to delete.
 */
export const deletePlayer = (id) => exec(`DELETE FROM player WHERE id = ?`, [id])

/**
 * Drop the table, removing all associated data
 */
export const dropPlayerTable = () => exec(`DROP TABLE IF EXISTS player`)

// #endregion Player
