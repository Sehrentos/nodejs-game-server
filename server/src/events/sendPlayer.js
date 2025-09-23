/**
 * Creates a "packet" containing the state of Player.
 *
 * Note: not every player property is sent.
 *
 * @param {import("../../../shared/models/Entity.js").TEntityProps} player - A player object.
 * @param {string[]} [props] - optional. Specific player properties to send.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TPlayerPacket - Player update sent from the server
 * @prop {"player"} type
 * @prop {import("../../../shared/models/Entity.js").TEntityProps} player
 */
export function sendPlayer(player, ...props) {
	// if no props are specified, send all
	if (props.length === 0) {
		return JSON.stringify({
			type: "player",
			player: {
				gid: player.gid,
				// aid: player.aid,
				spriteId: player.spriteId,
				name: player.name,
				lastMap: player.lastMap,
				lastX: player.lastX,
				lastY: player.lastY,
				// w: player.w,
				// h: player.h,
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
				range: player.range,
				atk: player.atk,
				atkMultiplier: player.atkMultiplier,
				mAtk: player.mAtk,
				mAtkMultiplier: player.mAtkMultiplier,
				eAtk: player.eAtk,
				eDef: player.eDef,
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
				//#region Arrays
				skills: player.skills,
				equipment: player.equipment,
				inventory: player.inventory,
				quests: player.quests,
				//#endregion
				partyId: player.partyId,
				latency: player.latency
			}
		})
	}

	// if props are specified, send only those
	const playerProps = {}
	Object.keys(player).forEach(key => props.includes(key) && (playerProps[key] = player[key]))

	return JSON.stringify({
		type: "player",
		player: playerProps
	})
}
