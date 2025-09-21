import { PLAYER_VIEW_AREA_SIZE } from "../../../shared/Constants.js";
import { ENTITY_TYPE } from "../../../shared/enum/Entity.js";
import { Entity } from "../../../shared/models/Entity.js";

/**
 * Creates a "packet" containing the state of map and it's entities.
 * - Only entities that are visible, alive and in range of player view size are sent
 *
 * @param {Entity} player
 * @param {import("../../../shared/models/WorldMap.js").WorldMap} map
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TMapPacket - Map update sent from the server
 * @prop {"map"} type
 * @prop {import("../../../shared/models/WorldMap.js").TWorldMapProps} map
 */
export function sendMap(player, map) {
	return JSON.stringify({
		type: "map",
		map: {
			id: map.id,
			name: map.name,
			width: map.width,
			height: map.height,
			// @ts-ignore filtered on purpose, so the client does not know everything. also to reduce packet size
			entities: map.entities.filter(PLAYER_VIEW_AREA_SIZE === 0
				? (entity) => entity.visible && entity.hp > 0
				: (entity) => entity.visible && entity.hp > 0 && Entity.inRangeOf(player, entity.lastX, entity.lastY, PLAYER_VIEW_AREA_SIZE)
			).map((entity) => {
				if (entity.type === ENTITY_TYPE.PORTAL) {
					return {
						id: entity.id,
						gid: entity.gid,
						spriteId: entity.spriteId,
						type: entity.type,
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
					}
				}
				if (entity.type === ENTITY_TYPE.PLAYER) {
					// entity is other player
					return {
						id: entity.id,
						gid: entity.gid,
						spriteId: entity.spriteId,
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
					}
				}
				return {
					id: entity.id,
					gid: entity.gid,
					spriteId: entity.spriteId,
					type: entity.type,
					lastX: entity.lastX,
					lastY: entity.lastY,
					dir: entity.dir,
					hp: entity.hp,
					hpMax: entity.hpMax,
					mp: entity.mp,
					mpMax: entity.mpMax,
				}
			})
		}
	})
}
