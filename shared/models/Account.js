/**
 * @typedef {Object} TAccount
 * @prop {number=} id
 * @prop {string=} username
 * @prop {string=} password
 * @prop {string=} email
 * @prop {number=} state
 * @prop {number=} expires
 * @prop {number=} logincount
 * @prop {Date=} lastlogin
 * @prop {string=} last_ip
 * @prop {string=} auth_token
 */

export class Account {
	/**
	 * @constructor
	 * @param {TAccount=} p - Account properties
	 */
	constructor(p) {
		this.id = p?.id ?? 0
		this.username = p?.username ?? ''
		this.password = p?.password ?? ''
		this.email = p?.email ?? ''
		this.state = p?.state ?? 0
		this.expires = p?.expires ?? 0
		this.logincount = p?.logincount ?? 0
		this.lastlogin = p?.lastlogin ?? new Date()
		this.last_ip = p?.last_ip ?? ''
		this.auth_token = p?.auth_token ?? null
	}
}
