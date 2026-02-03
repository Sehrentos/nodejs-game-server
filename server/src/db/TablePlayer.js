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
)`

/**
 * @typedef {Object} TPlayerTable
 * @prop {number} id - The database ID
 * @prop {number} account_id - The Account ID this player belongs to
 * @prop {number} sprite_id - The sprite ID of the player
 * @prop {string} name - The name of the player
 * @prop {number} base_level - The base level of the player
 * @prop {number} job_level - The job level of the player
 * @prop {number} base_exp - The base experience points of the player
 * @prop {number} job_exp - The job experience points of the player
 * @prop {number} job - The job/class of the player
 * @prop {number} sex - The sex of the player
 * @prop {number} money - The amount of money the player has
 * @prop {number} str - The strength stat of the player
 * @prop {number} agi - The agility stat of the player
 * @prop {number} vit - The vitality stat of the player
 * @prop {number} int - The intelligence stat of the player
 * @prop {number} dex - The dexterity stat of the player
 * @prop {number} luk - The luck stat of the player
 * @prop {number} hp - The current HP of the player
 * @prop {number} hp_max - The maximum HP of the player
 * @prop {number} mp - The current MP of the player
 * @prop {number} mp_max - The maximum MP of the player
 * @prop {number} last_map - The last map ID where the player was located
 * @prop {number} last_x - The last X coordinate where the player was located
 * @prop {number} last_y - The last Y coordinate where the player was located
 * @prop {number} save_map - The map ID where the player's position is saved
 * @prop {number} save_x - The X coordinate where the player's position is saved
 * @prop {number} save_y - The Y coordinate where the player's position is saved

 * @typedef {import("../../../shared/models/Entity.js").TEntityProps} TEntityProps
 */

/**
 * @module TablePlayer
 * A class to manage player-related database operations.
 */
export class TablePlayer {
	/** @param {import("./index.js").Database} database */
	constructor(database) {
		/** @type {import("./index.js").Database} */
		this.db = database;
	}

	/**
	 * Creates the table in the database if it doesn't already exist
	 */
	create() {
		return this.db.query('run', DB_CREATE)
	}

	/**
	 * Add a new player to the database.
	 *
	 * @param {import("../../../shared/models/Entity.js").TEntityProps=} player
	 * @returns {Promise<{id:number}>}
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

		return this.db.query('get',
			`
			INSERT INTO player (
				${names},
				last_login
			)
			VALUES (
				${values.map(() => '?').join(',')},
				?
			)
			RETURNING id`,
			[...values, new Date().toISOString()]
		)
	}

	/**
	 * Update a player in the database.
	 *
	 * @param {import("../../../shared/models/Entity.js").TEntityProps=} player
	 * @returns {Promise<{ id: number }>}
	 */
	async sync(player) {
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

		return this.db.query('get',
			`
			UPDATE player SET ${names},
				last_login = ?
			WHERE id=?
			RETURNING id
			`,
			[
				...values,
				new Date().toISOString(),
				player.id
			]
		)
	}

	/**
	 * Get players by their Account ID.
	 * @param {number} aid
	 * @returns {Promise<import("../../../shared/models/Entity.js").TEntityProps[]>}
	 */
	async getByAccountId(aid) {
		const rows = await this.db.all(
			`
			SELECT * FROM player
			WHERE account_id = ?
			`,
			[aid]
		)

		return rows.map(row => {
			/** @type {import("../../../shared/models/Entity.js").TEntityProps} */
			let props = {
				// Note: id | account_id can be number or bigint (MariaDB INTEGER auto_increment)
				id: Number(row.id),
				aid: Number(row.account_id),
				spriteId: Number(row.sprite_id),
				name: String(row.name),
				level: Number(row.base_level),
				jobLevel: Number(row.job_level),
				baseExp: Number(row.base_exp),
				jobExp: Number(row.job_exp),
				job: Number(row.job),
				sex: Number(row.sex),
				money: Number(row.money),
				str: Number(row.str),
				agi: Number(row.agi),
				vit: Number(row.vit),
				int: Number(row.int),
				dex: Number(row.dex),
				luk: Number(row.luk),
				hp: Number(row.hp),
				hpMax: Number(row.hp_max),
				mp: Number(row.mp),
				mpMax: Number(row.mp_max),
				lastMap: Number(row.last_map),
				lastX: Number(row.last_x),
				lastY: Number(row.last_y),
				saveMap: Number(row.save_map),
				saveX: Number(row.save_x),
				saveY: Number(row.save_y),
				lastLogin: new Date(String(row.last_login)),
			}
			return props
		})
	}

	/**
	 * Get total players in the database.
	 * @returns {Promise<number>}
	 */
	async getCount() {
		const result = await this.db.get(
			`
			SELECT COUNT(*) as count FROM player
			`
		)
		console.log('[DB] Player count result:', result);
		return Number(result?.count || 0)
	}

	/**
	 * Set player name. Trim name to 30 chars if too long.
	 * @param {number} id
	 * @param {string} name
	 * @returns {Promise<{name:string}>}
	 */
	setName(id, name) {
		// trim name to 30, if too long
		if (name.length > 30) name = name.slice(0, 30)
		return this.db.query('get',
			`
			UPDATE player SET name=?
			WHERE id=?
			RETURNING name
			`,
			[name, id]
		)
	}

	/**
	 * Delete an player by ID.
	 *
	 * @param {number} id - Player ID
	 * @returns {Promise<import("./index.js").TSQLResult>}
	 */
	delete(id) {
		return this.db.query('run',
			`
			DELETE FROM player WHERE id = ?
			`,
			[id]
		)
	}

	/**
	 * Drop the table, removing all associated data
	 * @returns {Promise<import("./index.js").TSQLResult>}
	 */
	drop() {
		return this.db.query('run',
			`
			DROP TABLE IF EXISTS player
			`
		)
	}
}
