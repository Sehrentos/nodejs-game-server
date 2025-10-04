import { PLAYER_VIEW_AREA_SIZE } from "../../../shared/Constants.js";
import { TYPE } from "../../../shared/enum/Entity.js";
import { Entity } from "../../../shared/models/Entity.js";
import { inRangeOf } from "../../../shared/utils/EntityUtils.js";

/**
 * Returns a subset of entity properties, depending on the type of entity.
 *
 * @param {import("../../../shared/models/Entity.js").TEntityProps} entity
 * @returns {import("../../../shared/models/Entity.js").TEntityProps}
 */
function getEntityProps(entity) {
	if (entity.type === TYPE.PORTAL) {
		return {
			id: entity.id,
			gid: entity.gid,
			spriteId: entity.spriteId,
			type: entity.type,
			lastX: entity.lastX,
			lastY: entity.lastY,
			size: entity.size,
			range: entity.range,
			dir: entity.dir,
			hp: entity.hp,
			hpMax: entity.hpMax,
			mp: entity.mp,
			mpMax: entity.mpMax,
			// portal only
			portalId: entity.portalId,
			portalX: entity.portalX,
			portalY: entity.portalY,
		}
	}
	if (entity.type === TYPE.PLAYER) {
		// entity is other player
		return {
			id: entity.id,
			gid: entity.gid,
			spriteId: entity.spriteId,
			type: entity.type,
			name: entity.name,
			lastX: entity.lastX,
			lastY: entity.lastY,
			size: entity.size,
			range: entity.range,
			dir: entity.dir,
			hp: entity.hp,
			hpMax: entity.hpMax,
			mp: entity.mp,
			mpMax: entity.mpMax,
		}
	}
	if (entity.type === TYPE.PET) {
		return {
			id: entity.id,
			gid: entity.gid,
			spriteId: entity.spriteId,
			type: entity.type,
			name: entity.name,
			lastX: entity.lastX,
			lastY: entity.lastY,
			dir: entity.dir,
			size: entity.size,
			range: entity.range,
			hp: entity.hp,
			hpMax: entity.hpMax,
			mp: entity.mp,
			mpMax: entity.mpMax,
		}
	}
	// other types
	return {
		id: entity.id,
		gid: entity.gid,
		spriteId: entity.spriteId,
		type: entity.type,
		lastX: entity.lastX,
		lastY: entity.lastY,
		size: entity.size,
		dir: entity.dir,
		hp: entity.hp,
		hpMax: entity.hpMax,
		mp: entity.mp,
		mpMax: entity.mpMax,
	}
}

/**
 * Returns a delta object containing the changed properties of an entity.
 * If no properties have changed, returns null.
 *
 * @param {Entity} entity - The entity to check for changes.
 * @returns {null|import("../../../shared/models/Entity.js").TEntityProps} The object containing the changed properties, or null if no changes.
 */
function getEntityDelta(entity) {
	/**
	 * these are the properties that have changed.
	 * @type {import("../../../shared/models/Entity.js").TEntityProps}
	 */
	let entityProps
	/**
	 * these are used to identify if an entity property has changed,
	 * since the last time it was checked from delta.
	 * @type {import("../../../shared/models/Entity.js").TEntityProps}
	 */
	let delta

	/**
	 * these are the allowed properties of an entity
	 * @type {import("../../../shared/models/Entity.js").TEntityProps}
	 */
	const filteredProps = getEntityProps(entity)

	// initialize delta object
	if (entity.delta == null) {
		entity.delta = {}
	}
	delta = entity.delta // for convenience

	// // check if entity position has changed
	// if (entity.lastX !== delta.lastX || entity.lastY !== delta.lastY) {
	// 	entityProps = { lastX: entity.lastX, lastY: entity.lastY }
	// 	// update delta object, so it can be used for next delta checks
	// 	delta.lastX = entity.lastX
	// 	delta.lastY = entity.lastY
	// }

	// // check if entity direction has changed
	// if (entity.dir !== delta.dir) {
	// 	entityProps = { ...entityProps, dir: entity.dir }
	// 	delta.dir = entity.dir
	// }

	// // check if entity health has changed
	// if (entity.hp !== delta.hp || entity.mp !== delta.mp) {
	// 	entityProps = { ...entityProps, hp: entity.hp, mp: entity.mp }
	// 	delta.hp = entity.hp
	// 	delta.mp = entity.mp
	// }

	// // check if entity sprite has changed
	// if (entity.spriteId !== delta.spriteId) {
	// 	entityProps = { ...entityProps, spriteId: entity.spriteId }
	// 	delta.spriteId = entity.spriteId
	// }

	// check if any other property has changed
	for (const key in filteredProps) {
		if (['control', 'delta'].includes(key)) continue
		if (entity[key] !== delta[key]) {
			entityProps = { ...entityProps, [key]: entity[key] }
			delta[key] = entity[key]
		}
	}

	// if no properties have changed, return null
	if (entityProps == null) return

	// remove any circular references
	delete delta.control;

	// if properties have changed, return them
	return { gid: entity.gid, ...entityProps }
}

/**
 * Creates a "packet" containing the full state of map and it's entities.
 * - Only entities that are visible, alive and in range of player view size are sent
 *
 * @param {Entity} player
 * @param {import("../../../shared/models/WorldMap.js").WorldMap} map
 * @param {boolean} [isFullUpdate=false]
 *
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TMapPacket - Map update sent from the server
 * @prop {"map"} type
 * @prop {import("../../../shared/models/WorldMap.js").TWorldMapProps} map
 */
export function sendMap(player, map, isFullUpdate = false) {
	return JSON.stringify({
		type: "map",
		map: {
			id: map.id,
			spriteId: map.spriteId,
			name: map.name,
			width: map.width,
			height: map.height,
			// filtered on purpose, so the client does not know everything. also to reduce packet size
			entities: map.entities.filter(isFullUpdate || PLAYER_VIEW_AREA_SIZE <= 0
				? (entity) => entity.visible /*&& entity.hp > 0*/
				: (entity) => entity.visible /*&& entity.hp > 0*/ && inRangeOf(player, entity.lastX, entity.lastY, PLAYER_VIEW_AREA_SIZE)
			).map(getEntityProps)
		}
	})
}

/**
 * Sends a "packet" containing the updated state of map entities.
 * each entity in map will be checked if it's state has changed,
 * and if so, it will be sent to the client.
 *
 * **Delta Updates/Compression:**
 *  Core Concept: Instead of sending the complete state of an entity every
 *  time it changes, the server sends only the differences (deltas) from
 *  the previous update. For example, if an entity's position changes slightly,
 *  the server only sends the change in coordinates, not the entire position.
 *  Implementation: The server tracks the changes in entity properties
 *  (position, rotation, health, etc.).
 *  It then generates a small packet containing only the changed values.
 *
 * @param {Entity} player
 * @param {import("../../../shared/models/WorldMap.js").WorldMap} map
 * @returns {string|null} The JSON stringified packet. Returns null if there are no updates.
 *
 * @typedef {Object} TMapUpdatePacket - Map update sent from the server
 * @prop {"map-update"} type
 * @prop {import("../../../shared/models/Entity.js").TEntityProps[]} entities
 */
export function sendMapUpdate(player, map) {
	const updateStack = [] // the delta updates

	// reduce packet size, by filtering out entities that are not visible or not in range
	const entities = map.entities.filter(PLAYER_VIEW_AREA_SIZE <= 0
		? (entity) => entity.visible/* && entity.hp > 0*/
		: (entity) => entity.visible/* && entity.hp > 0*/ && inRangeOf(player, entity.lastX, entity.lastY, PLAYER_VIEW_AREA_SIZE)
	)

	// delta updates, identify entity changes
	for (const entity of entities) {
		// dont send portal or npc, these are static for now
		if (entity.type === TYPE.PORTAL || entity.type === TYPE.NPC) continue
		let delta = getEntityDelta(entity)
		if (delta != null) updateStack.push(delta)
	}

	if (updateStack.length === 0) return
	return JSON.stringify({ type: "map-update", entities: updateStack })
}

/**
 * Sends a "packet" containing the new entities added to the map.
 * @param {import("../../../shared/models/Entity.js").TEntityProps[]} entity
 * @returns {string} The JSON stringified packet
 *
 * @typedef {Object} TMapNewEntityPacket - Map entity sent from the server
 * @prop {"map-new-entity"} type
 * @prop {import("../../../shared/models/Entity.js").TEntityProps[]} entities
 */
export function sendMapNewEntity(...entity) {
	return JSON.stringify({ type: "map-new-entity", entities: entity.map(getEntityProps) })
}

/**
 * Sends a "packet" containing the removed entities from the map.
 * @param {import("../../../shared/models/Entity.js").TEntityProps[]} entity
 * @returns {string} The JSON stringified packet
 *
 * @typedef {Object} TMapRemoveEntityPacket - Map entity sent from the server
 * @prop {"map-new-entity"} type
 * @prop {import("../../../shared/models/Entity.js").TEntityProps[]} entities
 */
export function sendMapRemoveEntity(...entity) {
	return JSON.stringify({ type: "map-remove-entity", entities: entity.map(getEntityProps) })
}



/**
 * Creates a "packet" containing the state of Entity on the map.
 *
 * @param {import("../../../shared/models/Entity.js").TEntityProps} entity
 * @param {string[]} [props] - optional. Specific properties to send.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TMapEntityPacket - Packet sent from the server
 * @prop {"entity"} type
 * @prop {import("../../../shared/models/Entity.js").TEntityProps} entity
 */
export function sendMapEntity(entity, ...props) {
	const type = "map-entity"

	// if no props are specified, send all
	if (props.length === 0) {
		return JSON.stringify({
			type,
			entity: getEntityProps(entity)
		})
	}

	// if props are specified, send only those
	const entityProps = {}
	Object.keys(entity).forEach(key => {
		if (props.includes(key)) {
			entityProps[key] = entity[key]
		}
	})

	return JSON.stringify({
		type,
		entity: entityProps
	})
}
