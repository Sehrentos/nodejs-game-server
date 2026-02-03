import 'dotenv/config';
import SQLiteDatabase from 'better-sqlite3';
import { TableAccount } from './TableAccount.js';
import { TableInventory } from './TableInventory.js';
import { TablePlayer } from './TablePlayer.js';

/**
 * @module Database
 * An database wrapper class.
 *
 * Note: If you later decide to change the database,
 * you need to change this class, which makes it easier to switch.
 *
 * This class is a wrapper for better-sqlite3.
 * It provides methods to connect to the database,
 * execute queries, and close the connection etc.
 */
export class Database {
	constructor(filepath) {
		/**
		 * @type {import('better-sqlite3').Database}
		 */
		this.db = new SQLiteDatabase(filepath || process.env.SQLITE_FILE || './database.sqlite', {
			readonly: false,
			verbose: console.log,
		});
		this.db.pragma('journal_mode = WAL');

		/** @type {TableAccount} */
		this.account = new TableAccount(this);
		/** @type {TableInventory} */
		this.inventory = new TableInventory(this);
		/** @type {TablePlayer} */
		this.player = new TablePlayer(this);

		// create tables if not exists
		// const stmts = [DB_CREATE_ACCOUNT, DB_CREATE_INVENTORY, DB_CREATE_PLAYER];
		// for (const sql of stmts) {
		// 	database.exec(sql);
		// }
	}


	/**
	 * Establishes a connection to the database.
	 *
	 * @returns {Promise<*>}
	 */
	async connect() {
		return this.db;
	}

	/**
	 * Execute a SQL command with optional parameters.
	 *
	 * Use for INSERT/UPDATE/DELETE/DROP statements.
	 *
	 * @param {*} sql
	 * @param {*} params
	 * @returns {Promise<{ affectedRows: number, insertId: number|bigint }>}
	 */
	async exec(sql, params = []) {
		const stmt = this.db.prepare(sql);
		const r = stmt.run(...params);
		return { affectedRows: r.changes, insertId: r.lastInsertRowid };
	}

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
	async query(sql, params = []) {
		const stmt = this.db.prepare(sql);
		return stmt.all(...params);
	}

	/**
	 * Executes a batch of SQL queries on the database,
	 * returning a promise that resolves to the query result.
	 *
	 * @param {string} sql
	 * @param {*} [values]
	 * @returns {Promise<*>}
	 */
	async batch(sql, values) {
		const stmt = this.db.prepare(sql);
		const insertMany = this.db.transaction((rows) => {
			for (const params of rows) {
				stmt.run(...params);
			}
		});
		return insertMany(values);
	}

	/**
	 * Closes the database connection.
	 *
	 * @returns {Promise<void>}
	 */
	async close() {
		this.db.close();
	}
}

export default new Database();
