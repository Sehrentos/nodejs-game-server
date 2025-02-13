// database class for controlling players
export class TablePlayer {
    /**
     * @constructor
     * @param {import("./Database.js").Database} db - The database object to use for queries
     */
    constructor(db) {
        /** @type {import("./Database.js").Database} */
        this.db = db
    }

    /**
     * Add a new player to the database.
     * 
     * @param {import("../models/Entity.js").TEntityProps=} player
     * @returns {Promise<import("./Database.js").TQueryResult>}
     */
    add(player) {
        // map player object to database columns
        const params = {
            account_id: player.aid,
            name: player.name,
            base_level: player.level,
            job_level: player.jobLevel,
            base_exp: player.baseExp,
            job_exp: player.jobExp,
            job: player.job,
            money: player.money,
            sex: player.sex,
            str: player.str,
            agi: player.agi,
            vit: player.vit,
            int: player.int,
            dex: player.dex,
            luk: player.luk,
            crit: player.crit,
            hp: player.hp,
            hp_max: player.hpMax,
            mp: player.mp,
            mp_max: player.mpMax,
            last_map: player.lastMap,
            last_x: player.lastX,
            last_y: player.lastY,
            save_map: player.saveMap,
            save_x: player.saveX,
            save_y: player.saveY
        }
        const names = Object.keys(params).map((v) => '`' + v + '`').join(',')
        const values = Object.values(params)
        return this.db.query(
            `INSERT INTO player (${names}) VALUES (${values.map(() => '?').join(',')})`,
            values
        )
    }

    /**
     * Update a player in the database.
     * 
     * @param {import("../models/Entity.js").TEntityProps=} player
     * @returns {Promise<import("./Database.js").TQueryResult>}
     */
    update(player) {
        // map player object to database columns
        const params = {
            name: player.name,
            base_level: player.level,
            job_level: player.jobLevel,
            base_exp: player.baseExp,
            job_exp: player.jobExp,
            job: player.job,
            money: player.money,
            sex: player.sex,
            str: player.str,
            agi: player.agi,
            vit: player.vit,
            int: player.int,
            dex: player.dex,
            luk: player.luk,
            crit: player.crit,
            hp: player.hp,
            hp_max: player.hpMax,
            mp: player.mp,
            mp_max: player.mpMax,
            last_map: player.lastMap,
            last_x: player.lastX,
            last_y: player.lastY,
            save_map: player.saveMap,
            save_x: player.saveX,
            save_y: player.saveY
        }
        // to `name`=? pairs
        const names = Object.keys(params).map((v) => '`' + v + '`=?').join(',')
        const values = Object.values(params)
        return this.db.query(
            `UPDATE player SET ${names} WHERE id=?`,
            [...values, player.id]
        )
    }

    /**
     * Get players by their Account ID.
     * @param {number} aid 
     * @returns {Promise<import("../models/Entity.js").TEntityProps[]>}
     */
    async getByAccountId(aid) {
        const rows = await this.db.query(
            `SELECT * FROM player WHERE account_id = ?`,
            [aid]
        )
        // map rows to Player objects
        return rows.map(player => ({
            id: player.id,
            aid: player.account_id,
            name: player.name,
            level: player.base_level,
            jobLevel: player.job_level,
            baseExp: player.base_exp,
            jobExp: player.job_exp,
            job: player.job,
            money: player.money,
            sex: player.sex,
            str: player.str,
            agi: player.agi,
            vit: player.vit,
            int: player.int,
            dex: player.dex,
            luk: player.luk,
            crit: player.crit,
            hp: player.hp,
            hpMax: player.hp_max,
            mp: player.mp,
            mpMax: player.mp_max,
            lastMap: player.last_map,
            lastX: player.last_x,
            lastY: player.last_y,
            saveMap: player.save_map,
            saveX: player.save_x,
            saveY: player.save_y
        }))
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

    static CREATE_TABLE = `CREATE TABLE IF NOT EXISTS \`player\` (
  \`id\` int(11) unsigned NOT NULL auto_increment,
  \`account_id\` int(11) unsigned NOT NULL default '0',
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
  \`crit\` smallint(4) unsigned NOT NULL default '0',
  \`hp\` int(11) unsigned NOT NULL default '0',
  \`hp_max\` int(11) unsigned NOT NULL default '0',
  \`mp\` int(11) unsigned NOT NULL default '0',
  \`mp_max\` int(11) unsigned NOT NULL default '0',
  \`matk\` int(11) unsigned NOT NULL default '0',
  \`party_id\` int(11) unsigned NOT NULL default '0',
  \`e_def\` int(11) unsigned NOT NULL default '0',
  \`body\` smallint(5) unsigned NOT NULL default '0',
  \`weapon\` smallint(6) unsigned NOT NULL default '0',
  \`shield\` smallint(6) unsigned NOT NULL default '0',
  \`head\` smallint(6) unsigned NOT NULL default '0',
  \`robe\` SMALLINT(6) UNSIGNED NOT NULL DEFAULT '0',
  \`last_map\` varchar(50) NOT NULL default '',
  \`last_x\` smallint(4) unsigned NOT NULL default '0',
  \`last_y\` smallint(4) unsigned NOT NULL default '0',
  \`save_map\` varchar(50) NOT NULL default '',
  \`save_x\` smallint(4) unsigned NOT NULL default '0',
  \`save_y\` smallint(4) unsigned NOT NULL default '0',
  \`sex\` smallint(1) unsigned NOT NULL default '0'
  \`last_login\` datetime DEFAULT NULL,

  PRIMARY KEY  (\`id\`),
  UNIQUE KEY \`name_key\` (\`name\`),
  KEY \`account_id\` (\`account_id\`),
  KEY \`party_id\` (\`party_id\`)
) AUTO_INCREMENT=1`
}
