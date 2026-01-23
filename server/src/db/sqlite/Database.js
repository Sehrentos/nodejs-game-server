import SQLiteDatabase from 'better-sqlite3';
import { TableAccount } from './TableAccount.js';
import { TablePlayer } from './TablePlayer.js';
import { TableInventory } from './TableInventory.js';

// singleton connection
let connection;

/**
 * @module Database
 * A database wrapper class for SQLite using better-sqlite3.
 *
 * This class provides methods to connect to the database, execute queries, and close the connection.
 *
 * Here's a brief explanation of each method:
 * - Constructor: Initializes the SQLite database connection with the specified file path.
 * - query(sql, params): Executes a SQL query on the database, returning the query result.
 * - close(): Closes the database connection.
 */
export class Database {
	constructor(dbFilePath = './database.sqlite') {
		this.db = connection || new SQLiteDatabase(dbFilePath, {
			readonly: false,
			verbose: console.log // optional logging function
		});
		this.db.pragma('journal_mode = WAL');

		// #region tables
		this.account = new TableAccount(this);
		this.player = new TablePlayer(this);
		this.inventory = new TableInventory(this);
		// #endregion
	}

	/**
	 * better-sqlite3 opens the database connection upon instantiation,
	 * so this method simply returns a resolved promise.
	 *
	 * @returns
	 */
	connect() {
		return Promise.resolve(this);
	}

	/**
	 * Executes a SQL query on the database, returning the query result.
	 *
	 * @param {string} sql
	 * @param {Array} [params]
	 */
	async query(sql, params = []) {
		const stmt = this.db.prepare(sql)
		return stmt.run(...params);
	}

	/**
	 * Closes the database connection.
	 */
	async close() {
		return this.db.close();
	}

	/**
	 * Just for symmetry with other databases,
	 * but it does nothing in better-sqlite3.
	 */
	end() {
		// return this.db.close();
	}
}
