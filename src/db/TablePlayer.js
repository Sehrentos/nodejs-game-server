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
     * @param {import("../model/Entity.js").TEntityProps=} player
     * @returns {Promise<{ affectedRows:number, insertId:number, warningStatus:number }>}
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
     * @param {import("../model/Entity.js").TEntityProps=} player
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
     * @returns {Promise<import("../model/Entity.js").TEntityProps[]>}
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

}
