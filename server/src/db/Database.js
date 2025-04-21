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
 * Database wrapper class.
 * This class definition creates a Database class
 * that manages a connection pool to a MariaDB database.
 * Here's a brief explanation of each method:
 * - Constructor: Initializes the database connection pool with configuration options from environment variables or default values.
 * - connect(): Returns a promise that resolves to a connection object from the pool, allowing you to execute queries.
 * - query(sql, params): Executes a SQL query on the database using the connection pool, returning a promise that resolves to the query result.
 * - close(): Closes the database connection pool, releasing any active connections.
 */
export class Database {
  constructor() {
    this.pool = mariadb.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'myUser',
      password: process.env.DB_PASS || 'myPassword',
      database: process.env.DB_DATABASE || 'myDatabase',
      port: Number(process.env.DB_PORT) || 3306,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 5
    });

    // #region tables
    this.account = new TableAccount(this);
    this.player = new TablePlayer(this);
	this.inventory = new TableInventory(this);
    // #endregion
  }

  /**
   * remember to close the connection, when done using
   * @example conn.end();
   * @returns {Promise<mariadb.PoolConnection>}
   */
  connect() {
    return this.pool.getConnection();
  }

  /**
   * @param {string | mariadb.QueryOptions} sql
   * @param {*} params
   * @returns {Promise<*>}
   */
  query(sql, params) {
    return this.pool.query(sql, params);
  }

  /**
   * @returns {Promise<void>}
   */
  close() {
    return this.pool.end();
  }
}
