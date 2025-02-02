import 'dotenv/config';
import mariadb from 'mariadb';
import { TableAccount } from './TableAccount.js';
import { TablePlayer } from './TablePlayer.js';

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

// const pool = mariadb.createPool({
//   host: process.env.DB_HOST || '127.0.0.1',
//   user: process.env.DB_USER || 'myUser',
//   password: process.env.DB_PASS || 'myPassword',
//   database: process.env.DB_DATABASE || 'myDatabase',
//   port: Number(process.env.DB_PORT) || 3306,
//   connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 5
// });

// async function asyncFunction() {
//   let conn;
//   try {
//     conn = await pool.getConnection();
//     const rows = await conn.query("SELECT username from account");
//     console.log(rows); //[ {val: 1}, meta: ... ]
//     // const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
//     // console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }

//   } catch (err) {
//     throw err;
//   } finally {
//     if (conn) conn.end();
//   }
// }

// asyncFunction().then(() => {
//   pool.end();
// });

/*
INSERT INTO `account` (username, password, email, state, expires, logincount, lastlogin, last_ip, auth_token)
VALUES ('john_doe', SHA2(CONCAT('password123', ${SALT}), 512), 'johndoe@example.com', 0, 0, 0, NOW(), '127.0.0.1', NULL);

*/