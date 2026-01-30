const DB_CREATE = `CREATE TABLE IF NOT EXISTS player (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL DEFAULT 0,
  sprite_id INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL UNIQUE DEFAULT '',
  base_level INTEGER NOT NULL DEFAULT 1,
  base_exp INTEGER NOT NULL DEFAULT 0,
  job INTEGER NOT NULL DEFAULT 0,
  job_level INTEGER NOT NULL DEFAULT 1,
  job_exp INTEGER NOT NULL DEFAULT 0,
  money INTEGER NOT NULL DEFAULT 0,
  str INTEGER NOT NULL DEFAULT 0,
  agi INTEGER NOT NULL DEFAULT 0,
  vit INTEGER NOT NULL DEFAULT 0,
  int INTEGER NOT NULL DEFAULT 0,
  dex INTEGER NOT NULL DEFAULT 0,
  luk INTEGER NOT NULL DEFAULT 0,
  hp INTEGER NOT NULL DEFAULT 0,
  hp_max INTEGER NOT NULL DEFAULT 0,
  mp INTEGER NOT NULL DEFAULT 0,
  mp_max INTEGER NOT NULL DEFAULT 0,
  party_id INTEGER NOT NULL DEFAULT 0,
  last_map INTEGER NOT NULL DEFAULT 0,
  last_x INTEGER NOT NULL DEFAULT 0,
  last_y INTEGER NOT NULL DEFAULT 0,
  save_map INTEGER NOT NULL DEFAULT 0,
  save_x INTEGER NOT NULL DEFAULT 0,
  save_y INTEGER NOT NULL DEFAULT 0,
  sex INTEGER NOT NULL DEFAULT 0,
  last_login TEXT DEFAULT NULL
);`.replace(/\s{2}|\n/gm, '')

/**
 * @module TablePlayer
 * A class to manage player-related database operations.
 */
export class TablePlayer {
	/** @param {import("./index.js").Database} database */
	constructor(database) {
		/** @type {import("./index.js").Database} */
		this.db = database;

		// create the database
		this.create();
	}

	/**
	 * Creates the table in the database if it doesn't already exist
	 */
	create() {
		return this.db.exec(DB_CREATE)
	}

	/**
	 * Add a new player to the database.
	 *
	 * @param {import("../../../../shared/models/Entity.js").TEntityProps=} player
	 */
	async add(player) {
		// map player object to database columns
		const params = {
			// aid string can be number or bigint in the database
			account_id: player.aid,
			sprite_id: player.spriteId,
			name: player.name,
			base_level: player.level,
			job_level: player.jobLevel,
			base_exp: player.baseExp,
			job_exp: player.jobExp,
			job: player.job,
			sex: player.sex,
			money: player.money,
			str: player.str,
			agi: player.agi,
			vit: player.vit,
			int: player.int,
			dex: player.dex,
			luk: player.luk,
			hp: player.hp,
			hp_max: player.hpMax,
			mp: player.mp,
			mp_max: player.mpMax,
			last_map: player.lastMap,
			last_x: player.lastX,
			last_y: player.lastY,
			save_map: player.saveMap,
			save_x: player.saveX,
			save_y: player.saveY,
			// last_login: player.lastLogin,
		}
		const names = Object.keys(params).map((v) => '`' + v + '`').join(',')
		const values = Object.values(params)
		return this.db.exec(
			`INSERT INTO player (${names}, last_login) VALUES (${values.map(() => '?').join(',')}, ?)`,
			[...values, new Date().toISOString()]
		)
	}

	/**
	 * Update a player in the database.
	 *
	 * @param {import("../../../../shared/models/Entity.js").TEntityProps=} player
	 */
	async update(player) {
		// map player object to database columns
		const params = {
			sprite_id: player.spriteId,
			name: player.name,
			base_level: player.level,
			job_level: player.jobLevel,
			base_exp: player.baseExp,
			job_exp: player.jobExp,
			job: player.job,
			sex: player.sex,
			money: player.money,
			str: player.str,
			agi: player.agi,
			vit: player.vit,
			int: player.int,
			dex: player.dex,
			luk: player.luk,
			hp: player.hp,
			hp_max: player.hpMax,
			mp: player.mp,
			mp_max: player.mpMax,
			last_map: player.lastMap,
			last_x: player.lastX,
			last_y: player.lastY,
			save_map: player.saveMap,
			save_x: player.saveX,
			save_y: player.saveY,
			// last_login: player.lastLogin,
		}
		// to `name`=? pairs
		const names = Object.keys(params).map((v) => '`' + v + '`=?').join(',')
		const values = Object.values(params)
		return this.db.exec(
			`UPDATE player SET ${names}, last_login = ? WHERE id=?`,
			[...values, new Date().toISOString(), player.id]
		)
	}

	/**
	 * Get players by their Account ID.
	 * @param {number} aid
	 * @returns {Promise<import("../../../../shared/models/Entity.js").TEntityProps[]>}
	 */
	async getByAccountId(aid) {
		const rows = await this.db.query(
			`SELECT * FROM player WHERE account_id = ?`,
			[aid]
		)

		return rows.map(row => {
			/** @type {import("../../../../shared/models/Entity.js").TEntityProps} */
			let props = {
				// Note: id | account_id can be number or bigint (MariaDB INTEGER auto_increment)
				id: Number(row.id),
				aid: Number(row.account_id),
				spriteId: Number(row.sprite_id),
				name: row.name,
				level: row.base_level,
				jobLevel: row.job_level,
				baseExp: row.base_exp,
				jobExp: row.job_exp,
				job: row.job,
				sex: row.sex,
				money: row.money,
				str: row.str,
				agi: row.agi,
				vit: row.vit,
				int: row.int,
				dex: row.dex,
				luk: row.luk,
				hp: row.hp,
				hpMax: row.hp_max,
				mp: row.mp,
				mpMax: row.mp_max,
				lastMap: row.last_map,
				lastX: row.last_x,
				lastY: row.last_y,
				saveMap: row.save_map,
				saveX: row.save_x,
				saveY: row.save_y,
				lastLogin: row.last_login,
			}
			return props
		})
	}

	/**
	 * Get total palyers.
	 * @returns {Promise<number>}
	 */
	async count() {
		const rows = await this.db.query(`SELECT COUNT(*) as count FROM player`)//=[{count: 2}]
		return rows[0]?.count || 0
	}

	/**
	 * Set player name. Trim name to 30 chars if too long.
	 * @param {number} id
	 * @param {string} name
	 */
	async setName(id, name) {
		// trim name to 30, if too long
		if (name.length > 30) name = name.slice(0, 30)
		return this.db.exec(`UPDATE player SET name=? WHERE id=?`, [name, id])
	}

	/**
	 * Delete an item by its database ID.
	 *
	 * @param {number} id - The database ID of the inventory item to delete.
	 */
	async delete(id) {
		return this.db.exec(`DELETE FROM player WHERE id = ?`, [id])
	}

	/**
	 * Drop the table, removing all associated data
	 */
	async drop() {
		return this.db.exec(`DROP TABLE IF EXISTS player`)
	}
}
