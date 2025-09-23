// database class for controlling players
const DB_CREATE = `CREATE TABLE IF NOT EXISTS \`player\` (
  \`id\` int(11) unsigned NOT NULL auto_increment,
  \`account_id\` int(11) unsigned NOT NULL default '0',
  \`sprite_id\` int(11) unsigned NOT NULL default '0',
  \`name\` varchar(30) NOT NULL DEFAULT '',
  \`base_level\` smallint(6) unsigned NOT NULL default '1',
  \`base_exp\` int(11) unsigned NOT NULL default '0',
  \`job\` smallint(6) unsigned NOT NULL default '0',
  \`job_level\` smallint(6) unsigned NOT NULL default '1',
  \`job_exp\` int(11) unsigned NOT NULL default '0',
  \`money\` int(11) unsigned NOT NULL default '0',
  \`str\` smallint(4) unsigned NOT NULL default '0',
  \`agi\` smallint(4) unsigned NOT NULL default '0',
  \`vit\` smallint(4) unsigned NOT NULL default '0',
  \`int\` smallint(4) unsigned NOT NULL default '0',
  \`dex\` smallint(4) unsigned NOT NULL default '0',
  \`luk\` smallint(4) unsigned NOT NULL default '0',
  \`hp\` int(11) unsigned NOT NULL default '0',
  \`hp_max\` int(11) unsigned NOT NULL default '0',
  \`mp\` int(11) unsigned NOT NULL default '0',
  \`mp_max\` int(11) unsigned NOT NULL default '0',
  \`party_id\` int(11) unsigned NOT NULL default '0',
  \`last_map\` varchar(50) NOT NULL default '',
  \`last_x\` smallint(4) unsigned NOT NULL default '0',
  \`last_y\` smallint(4) unsigned NOT NULL default '0',
  \`save_map\` varchar(50) NOT NULL default '',
  \`save_x\` smallint(4) unsigned NOT NULL default '0',
  \`save_y\` smallint(4) unsigned NOT NULL default '0',
  \`sex\` smallint(1) unsigned NOT NULL default '0',
  \`last_login\` datetime DEFAULT NULL,
  PRIMARY KEY  (\`id\`),
  UNIQUE KEY \`name_key\` (\`name\`),
  KEY \`account_id\` (\`account_id\`),
  KEY \`party_id\` (\`party_id\`)
) AUTO_INCREMENT=1;`;

export class TablePlayer {
	/**
	 * @constructor
	 * @param {import("./Database.js").Database} db - The database object to use for queries
	 */
	constructor(db) {
		/** @type {import("./Database.js").Database} */
		this.db = db

		// create the database
		this.create();
	}

	/**
	 * Creates the table in the database if it doesn't already exist.
	 *
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the create query
	 */
	create() {
		return this.db.query(DB_CREATE);
	}

	/**
	 * Add a new player to the database.
	 *
	 * @param {import("../../../shared/models/Entity.js").TEntityProps=} player
	 * @returns {Promise<import("./Database.js").TQueryResult>}
	 */
	add(player) {
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
		return this.db.query(
			`INSERT INTO player (${names}, last_login) VALUES (${values.map(() => '?').join(',')}, NOW())`,
			values
		)
	}

	/**
	 * Update a player in the database.
	 *
	 * @param {import("../../../shared/models/Entity.js").TEntityProps=} player
	 * @returns {Promise<import("./Database.js").TQueryResult>}
	 */
	update(player) {
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
		return this.db.query(
			`UPDATE player SET ${names}, last_login = NOW() WHERE id=?`,
			[...values, player.id]
		)
	}

	/**
	 * Get players by their Account ID.
	 * @param {number} aid
	 * @returns {Promise<import("../../../shared/models/Entity.js").TEntityProps[]>}
	 */
	async getByAccountId(aid) {
		const rows = await this.db.query(
			`SELECT * FROM player WHERE account_id = ?`,
			[aid]
		)
		// map rows to Player objects
		return rows.map(row => {
			/** @type {import("../../../shared/models/Entity.js").TEntityProps} */
			let props = {
				// Note: id | account_id can be number or bigint (MariaDB int(11) auto_increment)
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
		const rows = await this.db.query(`SELECT COUNT(*) as count FROM player`)
		return rows[0].count
	}

	/**
	 * Set player name. Trim name to 30 chars if too long.
	 * @param {number} id
	 * @param {string} name
	 * @returns {Promise<import("./Database.js").TQueryResult>}
	 */
	async setName(id, name) {
		// trim name to 30, if too long
		if (name.length > 30) name = name.slice(0, 30)
		return this.db.query(`UPDATE player SET name=? WHERE id=?`, [name, id])
	}

	/**
	 * Drop the table, removing all associated data.
	 * @returns {Promise<import("./Database.js").TQueryResult>} - The result of the drop query
	 */
	drop() {
		return this.db.query(`DROP TABLE IF EXISTS player`)
	}
}
