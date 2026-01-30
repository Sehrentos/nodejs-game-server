import crypto from 'node:crypto';
import { Account } from "../../../shared/models/Account.js";

const SALT = process.env.DB_SALT || 'your_unique_salt';

const DB_CREATE = `
CREATE TABLE IF NOT EXISTS account (
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
)
`;

/**
 * @typedef {Object} TAccountTable
 * @prop {number} id - The database ID
 * @prop {string} username - The username of the account
 * @prop {string} password - The hashed password of the account
 * @prop {string} email - The email of the account
 * @prop {number} state - The state of the account (e.g., logged in/out)
 * @prop {number} expires - The expiration time of the account
 * @prop {number} logincount - The number of times the account has logged in
 * @prop {string} lastlogin - The last login timestamp
 * @prop {string} last_ip - The last IP address used to login
 * @prop {string} auth_token - The authentication token (e.g., JWT)
 *
 * @typedef {import("../../../shared/models/Account.js").TAccount} TAccountProps
 */

/**
 * @module TableAccount
 * A class to manage account-related database operations.
 */
export class TableAccount {
	/** @param {import("./index.js").Database} database */
	constructor(database) {
		/** @type {import("./index.js").Database} */
		this.db = database;
	}

	/**
	 * Creates the table in the database if it doesn't already exist
	 */
	create() {
		return this.db.instance.exec(DB_CREATE)
	}

	/**
	 * Adds a new account to the database.
	 *
	 * @param {TAccountProps=} account
	 * @returns
	 */
	async add(account) {
		// SHA2(CONCAT(account.password, SALT), 512); // password hashing
		const hash = crypto.createHash('sha512');
		hash.update(account.password + SALT);
		const hashedPassword = hash.digest('hex'); // base64,hex

		return this.db.get(
			`
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
			RETURNING id
			`,
			account.username,
			hashedPassword,
			account.email,
			account.state,
			account.expires,
			account.logincount,
			account.lastlogin.toISOString(),
			account.last_ip,
			account.auth_token
		)
	}

	/**
	 * Update the authentication token for the given account ID.
	 *
	 * @param {string|number|bigint} id - The Account ID
	 * @param {string} token - The new authentication token
	 */
	async setToken(id, token) {
		return this.db.get(
			`
			UPDATE account SET auth_token = ?
			WHERE id = ?
			RETURNING id
			`,
			token,
			id
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
	async login(username, password, last_ip) {
		// SHA2(CONCAT(?, '${SALT}'), 512)
		const hash = crypto.createHash('sha512');
		hash.update(password + SALT);
		const hashedPassword = hash.digest('hex'); // base64,hex

		// update account state to logged in
		const row = await this.db.get(
			`
			UPDATE account
			SET state = 1,
				logincount = logincount + 1,
				lastlogin = ?,
				last_ip = ?,
				auth_token = NULL
			WHERE username = ?
			AND password = ?
			RETURNING id, username,
				email, state,
				expires, logincount,
				lastlogin, last_ip
			`,
			new Date().toISOString(),
			last_ip || "",
			username,
			hashedPassword
		)

		if (!row) {
			throw Error('Invalid login credentials')
		}

		return new Account(row)
	}

	/**
	 * Login attempt using the given token.
	 *
	 * @param {string} token - The token to validate
	 * @param {string=} last_ip - The last IP of the user. optional
	 * @returns {Promise<Account>} - The account object if the token is valid
	 */
	async loginToken(token, last_ip) {
		// update account state to logged in
		const account = await this.db.get(
			`
			UPDATE account
			SET state = 1,
				logincount = logincount + 1,
				lastlogin = ?,
				last_ip = ?
			WHERE auth_token = ?
			RETURNING id, username,
				email, state,
				expires, logincount,
				lastlogin, last_ip
			`,
			new Date().toISOString(),
			last_ip || "",
			token
		)

		if (!account) {
			throw Error('Invalid login token')
		}

		return new Account(account)
	}

	/**
	 * Logout an account by setting the state to 0 and optionally removing the token
	 *
	 * @param {string|number|bigint} id - The Account ID
	 * @param {boolean} clearToken - Whether to clear the token
	 */
	async logout(id, clearToken = true) {
		if (clearToken) {
			return this.db.query(`UPDATE account SET state = 0, auth_token = NULL WHERE id = ?`, id)
		}
		return this.db.query(`UPDATE account SET state = 0 WHERE id = ?`, id)
	}

	/**
	 * Logs out all accounts by setting their state to 0 and clearing their authentication tokens.
	 * This method updates the entire account table, effectively logging out all users.
	 *
	 * @param {boolean} clearToken - Whether to clear the token
	 */
	async logoutAll(clearToken = true) {
		if (clearToken) {
			return this.db.query(`UPDATE account SET state = 0, auth_token = NULL WHERE state = 1`)
		}
		return this.db.query(`UPDATE account SET state = 0 WHERE state = 1`)
	}

	/**
	 * Remove an account
	 * @param {string|number|bigint} id - The Account ID
	 */
	async delete(id) {
		return this.db.query(`DELETE FROM account WHERE id = ?`, id)
	}

	/**
	 * Drop the table, removing all associated data
	 */
	async drop() {
		return this.db.exec(`DROP TABLE IF EXISTS account`)
	}
}
