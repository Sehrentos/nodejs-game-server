// requires npm "mariadb": "^3.4.1"
import 'dotenv/config';
import mariadb from 'mariadb';
import { TableAccount } from './TableAccount.js';
import { TablePlayer } from './TablePlayer.js';
import { TableInventory } from './TableInventory.js';

/**
 * @typedef {Object} TQueryResult
 * @prop {number} affectedRows
 * @prop {number} insertId
 * @prop {number} warningStatus
 */

/**
 * @module Database
 * An database wrapper class. Note: If you later decide to change the database, you need to change this class, which makes it easier to switch.
 *
 * This class is a wrapper for mariadb. It provides methods to connect to the database, execute queries, and close the connection etc.
 *
 * Here's a brief explanation of each method:
 * - Constructor: Initializes the database connection pool with configuration options from environment variables or default values.
 * - connect(): Returns a promise that resolves to a connection object from the pool, allowing you to execute queries.
 * - query(sql, params): Executes a SQL query on the database using the connection pool, returning a promise that resolves to the query result.
 * - batch(sql, params): Executes a batch of SQL queries on the database using the connection pool, returning a promise that resolves to the query result.
 * - close(): Closes the database connection pool, releasing any active connections.
 *
 * @link https://mariadb.com/docs/connectors/mariadb-connector-nodejs/connector-nodejs-promise-api
 */
export class Database {
	constructor() {
		/** @type {mariadb.Pool} */
		this.pool = mariadb.createPool({
			host: process.env.DB_HOST || '127.0.0.1',
			user: process.env.DB_USER || 'myUser',
			password: process.env.DB_PASS || 'myPassword',
			database: process.env.DB_DATABASE || 'myDatabase',
			port: Number(process.env.DB_PORT) || 3306,
			connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 5,
			/**
			 * Debuggin: It is recommended to activate the trace option in development.
			 * Since the driver is asynchronous, enabling this option permits
			 * saving initial stack when calling any driver methods.
			 * This allows having interesting debugging information.
			 */
			trace: process.env.DB_TRACE === 'true' ? true : false
		});

		// #region tables
		/** @type {TableAccount} */this.account = new TableAccount(this);
		/** @type {TablePlayer} */this.player = new TablePlayer(this);
		/** @type {TableInventory} */this.inventory = new TableInventory(this);
		// #endregion

		// listen for the first connection event example:
		// pool.on('connection', (connection) => {
		// 	console.log(`New connection ${connection.threadId} created in pool`);
		// 	// You can initialize connections with specific settings
		// 	connection.query("SET SESSION time_zone='+00:00'");
		// 	connection.query("SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE'");
		// });
	}

	/**
	 * https://mariadb.com/docs/connectors/mariadb-connector-nodejs/connector-nodejs-promise-api#poolgetconnection--promise
	 *
	 * Returns a connection object from the pool, allowing you to execute queries.
	 *
	 * @returns {Promise<mariadb.PoolConnection>}
	 */
	connect() {
		return this.pool.getConnection();
	}

	/**
	 * https://mariadb.com/docs/connectors/mariadb-connector-nodejs/connector-nodejs-promise-api#poolquerysql-values---promise
	 *
	 * Executes a SQL query on the database using the connection pool, returning a promise that resolves to the query result.
	 *
	 * @param {string | mariadb.QueryOptions} sql
	 * @param {*} [values]
	 * @returns {Promise<*>}
	 */
	query(sql, values) {
		return this.pool.query(sql, values);
	}

	/**
	 * https://mariadb.com/docs/connectors/mariadb-connector-nodejs/connector-nodejs-batch-api#using-batching
	 *
	 * Executes a batch of SQL queries on the database using the connection pool, returning a promise that resolves to the query result.
	 *
	 * @param {string | mariadb.QueryOptions} sql
	 * @param {*} [values]
	 * @returns {Promise<*>}
	 */
	batch(sql, values) {
		return this.pool.batch(sql, values);
	}

	/**
	 * https://mariadb.com/docs/connectors/mariadb-connector-nodejs/connector-nodejs-promise-api#poolend--promise
	 *
	 * Closes the database connection pool, releasing any active connections.
	 *
	 * @returns {Promise<void>}
	 */
	close() {
		return this.pool.end();
	}

	/**
	 * https://mariadb.com/docs/connectors/mariadb-connector-nodejs/connector-nodejs-promise-api#pool-events
	 *
	 * Subscribes to pool events
	 *
	 * @param {"acquire"|"connection"|"release"|"error"} type
	 * @param {(conn: mariadb.Connection) => void} callback
	 *
	 * @returns {mariadb.Pool}
	 */
	on(type, callback) {
		// @ts-ignore event types are correct
		return this.pool.on(type, callback);
	}
}
