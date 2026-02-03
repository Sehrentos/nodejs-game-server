import { Worker } from 'worker_threads';
import DatabaseSync from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { TableAccount } from './TableAccount.js';
import { TableInventory } from './TableInventory.js';
import { TablePlayer } from './TablePlayer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Database value conversion
 * | SQLite Type | JS Type |
 * |-------------|---------|
 * | NULL        | null |
 * | REAL        | number |
 * | INTEGER     | number or bigint |
 * | TEXT        | string |
 * | BLOB        | Buffer |
 * @typedef {null|number|bigint|string|Buffer} TInputParams
 */
/**
 * @typedef {{ changes: number, lastInsertRowid: number }} TSQLResult
 */

/**
 * @module Database
 * This class represents a database connection and provides methods for executing SQL queries.
 *
 * Note: If you later decide to change the database,
 * you need to change this class, which makes it easier to switch.
 */
export class Database {
	constructor() {
		this.isConnected = false;

		// 1. Setup the "Fast Lane" Reader (Main Thread)
		/** @type {import('better-sqlite3').Database} */
		this.reader = new DatabaseSync(process.env.SQLITE_FILE || 'app_data.db', {
			readonly: true,
			// verbose: console.log, // enable verbose logging for debugging
		});
		this.reader.pragma('journal_mode = WAL');
		this.reader.pragma('synchronous = NORMAL');

		// 2. Setup the "Write Worker" (Background Thread)
		this.writer = new Worker(path.join(__dirname, 'write-worker.js'));
		this.pendingRequests = new Map();

		this.writer.on('message', ({ id, status, data, error }) => {
			const promise = this.pendingRequests.get(id);
			if (!promise) return;

			this.pendingRequests.delete(id);
			status === 'success' ? promise.resolve(data) : promise.reject(new Error(error));
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
		if (this.isConnected) return;
		this.isConnected = true;
		// create tables if not exists
		await this.account.create();
		await this.inventory.create();
		await this.player.create();
	}

	/**
	 * Closes the database connection.
	 * @returns {Promise<void>}
	 */
	async close() {
		this.reader.close();
		this.writer.terminate();
	}

	/**
	 * This method executes a prepared statement and returns the first result as an object.
	 *
	 * If the prepared statement does not return any results, this method returns undefined.
	 *
	 * READ: Execute immediately on the main thread.
	 *
	 * @param {string} query
	 * @param  {TInputParams[]} [params]
	 * @returns {Promise<any>}
	 */
	async get(query, params) {
		return this.reader.prepare(query).get(...(params || []));
	}

	/**
	 * This method executes a prepared statement and returns all results as an array of objects.
	 *
	 * If the prepared statement does not return any results, this method returns an empty array.
	 *
	 * READ: Execute immediately on the main thread.
	 *
	 * @param {string} query
	 * @param {TInputParams[]} [params]
	 * @returns {Promise<any>}
	 */
	async all(query, params) {
		return this.reader.prepare(query).all(...(params || []));
	}

	/**
	 * This method executes a prepared statement and returns information about the changes made.
	 *
	 * WRITE: Send to the worker queue and wait for the result.
	 *
	 * @param {"run"|"get"|"all"} action - The type of database action to perform ("run", "get", or "all").
	 * @param {string} query - The SQL statement to be executed.
	 * @param {TInputParams[] | TInputParams[][]} [params] - Parameters for the SQL statement. Can be a single value or an array of values for batch operations.
	 * @returns {Promise<any>}
	 *
	 * @example
	 * // single update example
	 * const result = await db.query(
	 *   'run',
	 *   'UPDATE users SET name = ? WHERE id = ?',
	 *   ['Alice', 1]
	 * );
	 *
	 * @example
	 * // bacth insert example
	 * const results = await db.query(
	 *   'run',
	 *   'INSERT INTO users (name, age) VALUES (?, ?)',
	 *   [['Alice', 30], ['Bob', 25], ['Charlie', 35]]
	 * );
	 */
	query(action, query, params) {
		return new Promise((resolve, reject) => {
			const id = crypto.randomUUID();
			this.pendingRequests.set(id, { resolve, reject });
			this.writer.postMessage({
				id,
				action,
				query,
				params: params || []
			});
		});
	}
}

/**
 * @type {Database}
 * The singleton database instance.
 */
export default new Database();
