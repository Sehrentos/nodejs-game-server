import { TableAccount } from './TableAccount.js';
import { TableInventory } from './TableInventory.js';
import { TablePlayer } from './TablePlayer.js';
import { DatabaseSync } from 'node:sqlite';

/**
 * @module Database
 * Database using node:sqlite.
 */
export class Database {
	/** @param {string} [filepath] - Path to the SQLite database file or ':memory:' for in-memory database */
	constructor(filepath) {
		/** @type {import("node:sqlite").DatabaseSync} */
		this.instance = new DatabaseSync(filepath || process.env.SQLITE_FILE || './database.sqlite', {
			open: false, // we will open it later
		});

		// initialize tables
		/** @type {TableAccount} */
		this.account = new TableAccount(this);
		/** @type {TableInventory} */
		this.inventory = new TableInventory(this);
		/** @type {TablePlayer} */
		this.player = new TablePlayer(this);
	}

	/**
	 * Opens the database connection and creates tables if they do not exist.
	 * @returns {Promise<void>}
	 */
	async connect() {
		if (this.instance.isOpen) return;
		this.instance.open();
		// create tables if not exists
		this.account.create();
		this.inventory.create();
		this.player.create();
	}

	/**
	 * Closes the database connection.
	 * @returns {Promise<void>}
	 */
	async close() {
		this.instance.close();
	}

	/**
	 * This method allows one or more SQL statements to be executed without returning any results.
	 *
	 * @param {string} sql
	 * @returns {Promise<void>}
	 */
	async exec(sql) {
		return this.instance.exec(sql);
	}

	/**
	 * This method executes a prepared statement and returns the first result as an object.
	 *
	 * If the prepared statement does not return any results, this method returns undefined.
	 *
	 * @param {string} sql
	 * @param  {...import("node:sqlite").SQLInputValue} params
	 * @returns
	 */
	async get(sql, ...params) {
		return this.instance.prepare(sql).get(...params);
	}

	/**
	 * This method executes a prepared statement and returns all results as an array of objects.
	 *
	 * If the prepared statement does not return any results, this method returns an empty array.
	 *
	 * @param {string} sql
	 * @param  {...import("node:sqlite").SQLInputValue} params
	 * @returns
	 */
	async all(sql, ...params) {
		return this.instance.prepare(sql).all(...params);
	}

	/**
	 * This method executes a prepared statement and returns information about the changes made.
	 *
	 * @param {string} sql
	 * @param {...import("node:sqlite").SQLInputValue} params
	 * @returns {Promise<import("node:sqlite").StatementResultingChanges>}
	 *
	 * @example
	 * const result = await db.query(
	 *   'UPDATE users SET name = ? WHERE id = ?',
	 *   'Alice',
	 *   1
	 * );
	 */
	async query(sql, ...params) {
		return this.instance.prepare(sql).run(...params);
	}

	/**
	 * This method executes a prepared statement multiple times with different parameter sets.
	 *
	 * @param {string} sql
	 * @param {Array<Array<import("node:sqlite").SQLInputValue>>} params
	 * @returns {Promise<Array<import("node:sqlite").StatementResultingChanges>>}
	 *
	 * @example
	 * const results = await db.batch(
	 *   'INSERT INTO users (name, age) VALUES (?, ?)',
	 *   [['Alice', 30], ['Bob', 25], ['Charlie', 35]]
	 * );
	 */
	async batch(sql, params) {
		const stmt = this.instance.prepare(sql);
		const results = [];
		for (const paramSet of params) {
			results.push(stmt.run(...paramSet));
		}
		return results;
	}
}

/**
 * @type {Database}
 * The singleton database instance.
 */
export default new Database();
