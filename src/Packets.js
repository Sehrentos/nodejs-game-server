/**
 * @typedef {import("./model/Entity.js").TEntityProps} TEntity
 * @typedef {import("./model/Player.js").TPlayerProps} TPlayer
 * @typedef {import("./model/Monster.js").TMonsterProps} TMonster
 * @typedef {import("./maps/WorldMap.js").TWorldMapProps} TWorldMap
 * @typedef {import("./control/EntityControl.js").EntityControl} EntityControl
 * @typedef {import("./control/PlayerControl.js").PlayerControl} PlayerControl
 * @typedef {import("./control/MonsterControl.js").MonsterControl} MonsterControl
 * @typedef {import("./control/NPCControl.js").NPCControl} NPCControl
 * 
 * @typedef {Object} TMapPacket
 * @prop {string} type
 * @prop {TWorldMap} map
 * 
 * @typedef {Object} TPlayerPacket
 * @prop {string} type
 * @prop {TPlayer} player
 * 
 * @typedef {Object} TChatPacket
 * @prop {string} type
 * @prop {string} channel
 * @prop {string} from
 * @prop {string} to
 * @prop {string} message
 * @prop {number=} timestamp Date.now()
 * 
 * @typedef {Object} TDialogPacket
 * @prop {string} type
 * @prop {string|string[]} dialog
 */

import { ENTITY_TYPE } from "./enum/Entity.js"

/**
 * Creates a "packet" containing the state of map and it's entities.
 * @param {TWorldMap} map - A map object.
 * @returns {TMapPacket}
 */
export const updateMap = (map) => ({
	type: "map",
	map: {
		name: map.name,
		width: map.width,
		height: map.height,
		// @ts-ignore filtered on purpose, so the client does not know everything
		entities: map.entities.filter((entity) => entity.hp > 0)
			.map((entity) => (entity.type === ENTITY_TYPE.WARP_PORTAL ? {
				gid: entity.gid,
				type: entity.type,
				name: entity.name,
				x: entity.x,
				y: entity.y,
				w: entity.w,
				h: entity.h,
				dir: entity.dir,
				hp: entity.hp,
				hpMax: entity.hpMax,
				mp: entity.mp,
				mpMax: entity.mpMax,
				//@ts-ignore type WARP_PORTAL
				portalTo: entity.portalTo,
			} : {
				gid: entity.gid,
				type: entity.type,
				name: entity.name,
				x: entity.x,
				y: entity.y,
				w: entity.w,
				h: entity.h,
				dir: entity.dir,
				hp: entity.hp,
				hpMax: entity.hpMax,
				mp: entity.mp,
				mpMax: entity.mpMax,
			})),
	}
})

/**
 * Creates a "packet" containing the state of Player.
 * @param {PlayerControl} player - A player object.
 * @returns {TPlayerPacket}
 */
export const updatePlayer = (player) => ({
	type: "player",
	player: {
		gid: player.gid,
		name: player.name,
		mapName: player.mapName,
		x: player.x,
		y: player.y,
		w: player.w,
		h: player.h,
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
		skills: player.skills,
		equipment: player.equipment,
		inventory: player.inventory,
		quests: player.quests,
		party: player.party,
	}
})

/**
 * Creates a "packet" containing the state of a chat message from the given user to the given recipient.
 * @param {string} channel - The chat channel.
 * @param {string} from - The username of the sender.
 * @param {string} to - The username of the recipient.
 * @param {string} message - The message to send.
 * @param {number=} timestamp - The timestamp of the message.
 * @returns {TChatPacket} A packet object containing the chat information.
 */
export const updateChat = (channel, from, to, message, timestamp) => ({
	type: "chat",
	timestamp: timestamp || Date.now(),
	channel: channel || "default", // default|private|log|...
	from: from,
	to: to,
	message: message
})

/**
 * Creates a packet containing the NPC's dialog text.
 * @param {string|string[]} dialog - The NPC's dialog text.
 * @returns {TDialogPacket} A packet object containing the NPC's dialog text.
 */
export const updateNPCDialog = (dialog) => ({
	type: "npc-dialog",
	dialog
})
