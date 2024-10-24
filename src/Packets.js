/**
 * @typedef {import("./model/Entity.js").EntityProps} TEntity
 * @typedef {import("./model/Player.js").PlayerProps} TPlayer
 * @typedef {import("./model/Monster.js").MonsterProps} TMonster
 * @typedef {import("./WorldMap.js").WorldMapProps} TWorldMap
 * @typedef {import("./control/EntityControl.js").EntityControl} EntityControl
 * @typedef {import("./control/PlayerControl.js").PlayerControl} PlayerControl
 * @typedef {import("./control/MonsterControl.js").MonsterControl} MonsterControl
 * 
 * @typedef {Object} TMapPacket
 * @prop {string} type
 * @prop {TWorldMap} map
 * 
 * @typedef {Object} TPlayerPacket
 * @prop {string} type
 * @prop {TPlayer} player
 */
export const Packets = {
	/**
	 * Creates a "tick" packet containing the state of entities (locations).
	 * @param {TWorldMap} map - A map object.
	 * @returns {TMapPacket}
	 */
	updateMap: (map) => ({
		type: "map",
		map: {
			map: map.name,
			width: map.width,
			height: map.height,
			// @ts-ignore filtered on purpose, so the client does not know everything
			entities: map.entities.map((entity) => ({
				gid: entity.gid,
				type: entity.type,
				name: entity.name,
				x: entity.x,
				y: entity.y,
				dir: entity.dir,
				hp: entity.hp,
				hpMax: entity.hpMax,
				mp: entity.mp,
				mpMax: entity.mpMax,
				portalTo: entity.portalTo, // portal entity
			})),
		}
	}),
	/**
	 * Creates a "player" map packet containing the state of Player.
	 * @param {PlayerControl} player - A player object.
	 * @returns {TPlayerPacket}
	 */
	updatePlayer: (player) => ({
		type: "player",
		// @ts-ignore filtered on purpose, so the client does not know everything
		player: {
			gid: player.gid,
			name: player.name,
			x: player.x,
			y: player.y,
			dir: player.dir,
			hp: player.hp,
			hpMax: player.hpMax,
			mp: player.mp,
			mpMax: player.mpMax,
			level: player.level,
			jobLevel: player.jobLevel,
			baseExp: player.baseExp,
			jobExp: player.jobExp,
			money: player.money,
			atk: player.atk,
			atkMultiplier: player.atkMultiplier,
			mAtk: player.mAtk,
			mAtkMultiplier: player.mAtkMultiplier,
			elementAtk: player.elementAtk,
			elementDef: player.elementDef,
			def: player.def,
			defMultiplier: player.defMultiplier,
			mDef: player.mDef,
			mDefMultiplier: player.mDefMultiplier,
			dodge: player.dodge,
			dodgeMultiplier: player.dodgeMultiplier,
			speed: player.speed,
			str: player.str,
			agi: player.agi,
			vit: player.vit,
			int: player.int,
			dex: player.dex,
			luk: player.luk,
			hit: player.hit,
			hpRecovery: player.hpRecovery,
			mpRecovery: player.mpRecovery,
			job: player.job,
			sex: player.sex,
			skills: player.skills,
			equipment: player.equipment,
			inventory: player.inventory,
			quests: player.quests,
			party: player.party,
		}
	}),
}