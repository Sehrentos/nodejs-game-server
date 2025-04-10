import { PLAYER_VIEW_AREA_SIZE } from "../Constants.js"
import { ENTITY_TYPE } from "../enum/Entity.js"
import { Entity } from "../models/Entity.js"

/**
 * @typedef {import("../models/Entity.js").TEntityProps} TEntity
 * @typedef {import("../models/WorldMap.js").TWorldMapProps} TWorldMap
 *
 * @typedef {Object} TPlayerLeavePacket - Player leave packet
 * @prop {"player-leave"} type
 * @prop {string} name
 *
 * @typedef {Object} TPlayerLogoutPacket - Player logout packet
 * @prop {"logout"} type
 *
 * @typedef {Object} TMapPacket - Map update sent from the server
 * @prop {"map"} type
 * @prop {TWorldMap} map
 *
 * @typedef {Object} TPlayerPacket - Player update sent from the server
 * @prop {"player"} type
 * @prop {TEntity} player
 *
 * @typedef {Object} TChatPacket - Chat message sent from the server or player
 * @prop {"chat"} type
 * @prop {string} channel
 * @prop {string} from
 * @prop {string} to
 * @prop {string} message
 * @prop {number=} timestamp Date.now()
 *
 * @typedef {Object} TDialogPacket - NPC dialog sent from the server
 * @prop {"npc-dialog"} type
 * @prop {string} gid
 * @prop {string} dialog
 *
 * @typedef {Object} TDialogResponsePacket - NPC dialog response sent from the player
 * @prop {"dialog"} type "dialog"
 * @prop {string} action e.g. "open", "close", "next"
 * @prop {string} gid
 * @prop {string} playerGid
 *
 * @typedef {Object} THeartbeatPacket - Ping/Pong packet sent from the server/client
 * @prop {"ping"|"pong"} type
 * @prop {number} timestamp
 */

/**
 * Creates a "player-leave" packet with the given player name. This is sent when socket is closed.
 *
 * @param {string} name - The name of the player leaving.
 */
export const playerLeave = (name) => JSON.stringify({ type: "player-leave", name })

/**
 * Creates a "logout" packet which is sent when the player logs out.
 */
export const playerLogout = () => JSON.stringify({ type: "logout" })

/**
 * Creates a "ping/pong" packet. Used to get player latency.
 *
 * @param {"ping"|"pong"} type - The type of the packet.
 * @param {number} timestamp - The timestamp of the packet.
 */
export const heartbeat = (type, timestamp) => JSON.stringify({ type, timestamp })

/**
 * Creates a "packet" containing the state of map and it's entities.
 * - Only entities that are visible, alive and in range of player view size are sent
 *
 * @param {Entity} player
 * @param {TWorldMap} map
 */
export const updateMap = (player, map) => JSON.stringify({
	type: "map",
	map: {
		id: map.id,
		name: map.name,
		width: map.width,
		height: map.height,
		// @ts-ignore filtered on purpose, so the client does not know everything
		entities: map.entities.filter(PLAYER_VIEW_AREA_SIZE === 0
			? (entity) => entity.visible && entity.hp > 0
			: (entity) => entity.visible && entity.hp > 0 && Entity.inRangeOf(player, entity.lastX, entity.lastY, PLAYER_VIEW_AREA_SIZE)
		).map((entity) => (entity.type === ENTITY_TYPE.PORTAL ? {
			id: typeof entity.id === "bigint" ? entity.id.toString() : entity.id,
			gid: entity.gid,
			type: entity.type,
			name: entity.name,
			lastX: entity.lastX,
			lastY: entity.lastY,
			w: entity.w,
			h: entity.h,
			range: entity.range,
			dir: entity.dir,
			hp: entity.hp,
			hpMax: entity.hpMax,
			mp: entity.mp,
			mpMax: entity.mpMax,
			// portal only
			portalName: entity.portalName,
			portalX: entity.portalX,
			portalY: entity.portalY,
		} : {
			id: typeof entity.id === "bigint" ? entity.id.toString() : entity.id,
			gid: entity.gid,
			type: entity.type,
			name: entity.name,
			lastX: entity.lastX,
			lastY: entity.lastY,
			w: entity.w,
			h: entity.h,
			range: entity.range,
			dir: entity.dir,
			hp: entity.hp,
			hpMax: entity.hpMax,
			mp: entity.mp,
			mpMax: entity.mpMax,
		}))
	}
})

/**
 * Creates a "packet" containing the state of Player.
 * @param {TEntity} player - A player object.
 */
export const updatePlayer = (player) => JSON.stringify({
	type: "player",
	player: {
		gid: player.gid,
		name: player.name,
		lastMap: player.lastMap,
		lastX: player.lastX,
		lastY: player.lastY,
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

/**
 * Creates a "packet" containing the state of a chat message from the given user to the given recipient.
 * @param {string} channel - The chat channel.
 * @param {string} from - The username of the sender.
 * @param {string} to - The username of the recipient.
 * @param {string} message - The message to send.
 * @param {number=} timestamp - The timestamp of the message.
 */
export const updateChat = (channel, from, to, message, timestamp) => JSON.stringify({
	type: "chat",
	timestamp: timestamp || Date.now(),
	channel: channel || "default", // default|private|log|...
	from: from,
	to: to,
	message: message
})

/**
 * Creates a packet containing the NPC's dialog text.
 * @param {string} gid - The NPC's gid.
 * @param {string} dialog - The NPC's dialog text.
 */
export const updateNPCDialog = (gid, dialog) => JSON.stringify({
	type: "npc-dialog",
	gid,
	dialog
})

// /**
//  * TODO handle sending binary data instead JSON string
//  *
//  * @param {string} channel - The chat channel.
//  * @param {string} from - The username of the sender.
//  * @param {string} to - The username of the recipient.
//  * @param {string} message - The message to send.
//  * @param {number=} timestamp - The timestamp of the message.
//  */
// export const updateChatAsBuffer = (channel, from, to, message, timestamp) => {
// 	// create buffer for timestamp Number
// 	// Total size: 1 byte header + 8 bytes timestamp = 9 bytes
// 	const buf = Buffer.alloc(9)
// 	buf.writeUInt8(0x21, 0); // header 0x21 = 33
// 	buf.writeDoubleBE(timestamp || Date.now(), 1)

// 	return Buffer.concat([
// 		buf,
// 		Buffer.from(channel),
// 		Buffer.from(from),
// 		Buffer.from(to),
// 		Buffer.from(message)
// 	])
// }
