import { Account } from "../model/Account.js";

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
     * @param {import("../model/Account.js").TAccount=} account - The account object
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

    updateToken(id, token) {
        return this.db.query(
            `UPDATE account SET auth_token = ? WHERE id = ?`,
            [token, id]
        )
    }

    /**
     * Login attempt using the given username and password.
     * @param {string} username - The username to validate
     * @param {string} password - The password to validate
     * @param {string=} last_ip - The last IP of the user. optional
     * @returns {Promise<import("../model/Account.js").Account>} - The account object if the login is valid, otherwise undefined
     */
    async login(username, password, last_ip) {
        const rows = await this.db.query(
            `SELECT * FROM account WHERE username = ? AND password = SHA2(CONCAT(?, '${SALT}'), 512)`,
            [username, password]
        )
        if (rows.length === 0) return;
        if (last_ip) {
            await this.db.query(
                `UPDATE account SET logincount = logincount + 1, lastlogin = NOW(), last_ip = ? WHERE id = ?`,
                [last_ip, rows[0].id]
            )
        }
        return new Account(rows[0])
    }

    /**
     * Login attempt using the given token.
     * @param {string} token - The token to validate
     * @returns {Promise<import("../model/Account.js").Account>} - The account object if the login is valid, otherwise undefined
     */
    async loginToken(token) {
        const rows = await this.db.query(
            `SELECT * FROM account WHERE auth_token = ?`,
            [token]
        )
        if (rows.length > 0) {
            return new Account(rows[0])
        }
    }
}
