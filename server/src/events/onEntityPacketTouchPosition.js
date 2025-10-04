import { inRangeOfEntity, findMapEntitiesInRadius } from "../../../shared/utils/EntityUtils.js"
import { PLAYER_TOUCH_AREA_SIZE } from "../../../shared/Constants.js"
import { TYPE } from "../../../shared/enum/Entity.js"
import { sendDialog } from "./sendDialog.js"

/**
 * Handles the click/touch event on the map from the player.
 * If an entity is found within a touch area radius, interact with the entity.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} player
 * @param {import("../../../client/src/events/sendTouchPosition.js").TTouchPositionPacket} json - The JSON object containing click coordinates.
 * @param {number} timestamp - The current timestamp or performance.now().
 */
export default function onEntityPacketTouchPosition(player, json, timestamp) {
	const ctrl = player.control
	ctrl.stopAttack()
	ctrl.stopFollow()
	ctrl.stopMoveTo()

	if (player.hp <= 0) return // must be alive

	// find entities at clicked position in x radius
	const entities = findMapEntitiesInRadius(ctrl.map, json.x, json.y, PLAYER_TOUCH_AREA_SIZE)
		.filter(entity => entity.gid !== player.gid) // exclude self

	// if no entities found
	// start moving to the clicked position
	if (entities.length === 0) {
		ctrl.moveTo(json.x, json.y, timestamp)
		return
	}

	// 1. priority - Monster (alive)
	const mobs = entities.filter(e => e.type === TYPE.MONSTER && e.hp > 0)
	if (mobs.length) {
		return touch(player, mobs[0], timestamp)
	}

	// 2. priority - NPC
	const npcs = entities.filter(e => e.type === TYPE.NPC)
	if (npcs.length) {
		return touch(player, npcs[0], timestamp)
	}

	// 3. priority - Player
	const players = entities.filter(e => e.type === TYPE.PLAYER)
	if (players.length) {
		return touch(player, players[0], timestamp)
	}

	// 4. priority - PORTAL
	const portals = entities.filter(e => e.type === TYPE.PORTAL)
	if (portals.length) {
		return touch(player, portals[0], timestamp)
	}

	// 5. move to position
	ctrl.moveTo(json.x, json.y, timestamp)
}

/**
 * Handles the interaction between a player and another entity when the player touches/clicks
 * on the map. Depending on the type of entity, the player may attack, follow, or interact
 * with the entity. The interaction logic varies:
 * - If the entity is a MONSTER, the player will attack it.
 * - If the entity is a PLAYER and the map is PVP-enabled, the player will attack the other player.
 * - If the entity is an NPC, the player will follow the NPC if not in range, or interact if in range.
 * - If the entity is a PORTAL, the player will move to the portal's position.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} player - The player entity initiating the interaction.
 * @param {import("../../../shared/models/Entity.js").Entity} entity - The target entity being interacted with.
 * @param {number} timestamp - The current timestamp or performance.now().
 */
function touch(player, entity, timestamp) {
	const ctrl = player.control
	const inRange = inRangeOfEntity(player, entity)

	switch (entity.type) {
		case TYPE.MONSTER:
			ctrl.attack(entity, timestamp)
			break;

		case TYPE.PLAYER:
			// player interaction
			if (ctrl.map.isPVP) {
				// in PVP maps, players can attack each other
				ctrl.attack(entity, timestamp)
			}
			break;

		case TYPE.NPC:
			// must be in range to interact with
			if (!inRange) {
				// start moving towards the NPC
				ctrl.follow(entity, timestamp)
				return
			}
			// in range of the NPC
			// while interacting with an NPC disable entity movement
			entity.isMoveable = false
			// send start NPC interact message
			ctrl.socket.send(sendDialog(entity.gid, entity.dialog))
			break;

		case TYPE.PORTAL:
			ctrl.moveTo(entity.lastX, entity.lastY, timestamp)
			break;

		default:
			break;
	}

	// DEBUG
	console.log(`[Event.onEntityPacketTouchPosition] (inRange:${inRange}) "${player.name}" interact with "${entity.name}" x:${entity.lastX}, y:${entity.lastY} (gid: ${entity.gid})`)
}
