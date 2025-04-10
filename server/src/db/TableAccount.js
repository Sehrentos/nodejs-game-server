import { Account } from "../../../shared/models/Account.js";

const SALT = process.env.DB_SALT || 'your_unique_salt';

// database class for controlling accounts
export class TableAccount {
    /**
     * @constructor
     * @param {import("./Database.js").Database} db - The database object to use for queries
     */
    constructor(db) {
        /** @type {import("./Database.js").Database} */
        this.db = db
    }

    /**
     * Note: on duplicate username, it will throw `Error.code='ER_DUP_ENTRY'`
     * @param {import("../../../shared/models/Account.js").TAccount=} account - The account object
     * @returns {Promise<{ affectedRows:number, insertId:number, warningStatus:number }>}
     */
    add(account) {
        return this.db.query(
            `INSERT INTO account (username, password, email, state, expires, logincount, lastlogin, last_ip, auth_token)
            VALUES (?, SHA2(CONCAT(?, '${SALT}'), 512), ?, ?, ?, ?, ?, ?, ?)`,
            [
                account.username,
                account.password,
                account.email,
                account.state,
                account.expires,
                account.logincount,
                account.lastlogin,
                account.last_ip,
                account.auth_token
            ]
        )
    }

    /**
     * Update the authentication token for the given account ID.
     * @param {string|number|bigint} id - The Account ID
     * @param {string} token - The new authentication token
     * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the update query
     */
    updateToken(id, token) {
        return this.db.query(`UPDATE account SET auth_token = ? WHERE id = ?`, [token, id])
    }

    /**
     * Login attempt using the given username and password.
     * @param {string} username - The username to validate
     * @param {string} password - The password to validate
     * @param {string=} last_ip - The last IP of the user. optional
     * @returns {Promise<import("../../../shared/models/Account.js").Account>} - The account object if the login is valid
     */
    async login(username, password, last_ip) {
        const rows = await this.db.query(
            `SELECT * FROM account WHERE username = ? AND password = SHA2(CONCAT(?, '${SALT}'), 512)`,
            [username, password]
        )

        if (rows.length === 0) {
            throw Error('Invalid login credentials')
        }

        // check if account is already logged in
        // if (rows[0].state === 1) {
        //     throw Error('Account already logged in')
        // }

        await this.db.query(
            `UPDATE account SET state = 1, logincount = logincount + 1, lastlogin = NOW(), last_ip = ? WHERE id = ?`,
            [last_ip || "", rows[0].id]
        )

        return new Account(rows[0])
    }

    /**
     * Login attempt using the given token.
     * @param {string} token - The token to validate
     * @returns {Promise<import("../../../shared/models/Account.js").Account>} - The account object if the token is valid
     */
    async loginToken(token) {
        const rows = await this.db.query(
            `SELECT * FROM account WHERE auth_token = ?`,
            [token]
        )

        if (rows.length === 0) {
            throw Error('Invalid login token')
        }

        await this.db.query(
            `UPDATE account SET state = 1, logincount = logincount + 1, lastlogin = NOW() WHERE id = ?`,
            [rows[0].id]
        )

        return new Account(rows[0])
    }

    /**
     * Remove an account
     * @param {string|number|bigint} id - The Account ID
     * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the update query
     */
    delete(id) {
        return this.db.query(`DELETE FROM account WHERE id = ?`, [id])
    }

    /**
     * Logout an account by setting the state to 0 and optionally removing the token
     * @param {string|number|bigint} id - The Account ID
     * @param {boolean} clearToken - Whether to clear the token
     * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the update query
     */
    logout(id, clearToken = true) {
        if (clearToken) {
            return this.db.query(`UPDATE account SET state = 0, auth_token = NULL WHERE id = ?`, [id])
        }
        return this.db.query(`UPDATE account SET state = 0 WHERE id = ?`, [id])
    }

    /**
     * Logs out all accounts by setting their state to 0 and clearing their authentication tokens.
     * This method updates the entire account table, effectively logging out all users.
     * @param {boolean} clearToken - Whether to clear the token
     * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the update query
     */
    logoutAll(clearToken = true) {
        if (clearToken) {
            return this.db.query(`UPDATE account SET state = 0, auth_token = NULL WHERE state = 1`)
        }
        return this.db.query(`UPDATE account SET state = 0 WHERE state = 1`)
    }
}
