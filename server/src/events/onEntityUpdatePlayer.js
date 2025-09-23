import { COOLDOWN_SOCKET_SEND_MAP, COOLDOWN_SOCKET_SEND_PLAYER } from "../../../shared/Constants.js";
import { sendMap } from "./sendMap.js";
import { sendPlayer } from "./sendPlayer.js";

/**
 * Player update/tick
 * --
 * Used to send frequent updates to the client:
 * - send `updateMap` contains full map state
 * - send `updatePlayer` contains full player state
 *
 * TODO:
 * - Aggregated Updates (Batching)
 * - Delta Updates
 *
 * @param {import("../../../shared/models/Entity.js").Entity} player
 * @param {number} timestamp
 */
export default function onEntityUpdatePlayer(player, timestamp) {
	try {
		const ctrl = player.control
		const map = ctrl.map

		// TODO Aggregated Updates (Batching):
		// Core Concept: Multiple updates for different entities are combined into
		// a single packet before being sent to the client. This reduces the overhead of sending individual packets.
		// Implementation: The server buffers updates for a short period and
		// then packages them together into a single message.

		// TODO Delta Updates:
		// Core Concept: Instead of sending the complete state of an entity every
		// time it changes, the server sends only the differences (deltas) from
		// the previous update. For example, if an entity's position changes slightly,
		// the server only sends the change in coordinates, not the entire position.
		// Implementation: The server tracks the changes in entity properties
		// (position, rotation, health, etc.).
		// It then generates a small packet containing only the changed values.

		// send full map state update
		// so the client can update the map and it's entities
		// TODO: this should only be sent, when player enters a new map
		// and use aggregated or delta updates afterwards to update entity positions
		if (ctrl._socketSentMapUpdateCd.isExpired(timestamp) && map != null) {
			ctrl._socketSentMapUpdateCd.set(timestamp + COOLDOWN_SOCKET_SEND_MAP)
			ctrl.socket.send(sendMap(player, map))
		}

		// send full player state update (e.g. every 5-10 seconds)
		// example this is sent, when player enters a new map
		// use aggregated or delta updates afterwards to update player state
		if (ctrl._socketSentPlayerUpdateCd.isExpired(timestamp)) {
			ctrl._socketSentPlayerUpdateCd.set(timestamp + COOLDOWN_SOCKET_SEND_PLAYER)
			ctrl.socket.send(sendPlayer(player))
		}

		// TODO implement other player updates, like stats that needs to be more frequent?
		// skills, equipment, inventory, quests for example, does not need to be updated so frequently.

		// check if player is alive, for the rest of the function
		if (player.hp <= 0) return

		// automatic HP recovery
		// calculate how much hp to restore on each tick
		ctrl.autoRegenerate(timestamp)

		// find entities in nearby for an auto-attack
		ctrl.nearbyAutoAttack(timestamp)

		// continue following target if set
		if (ctrl._follow != null) {
			ctrl.follow(ctrl._follow, timestamp)
		}

		// continue moving to set position if set
		if (ctrl._moveTo != null) {
			ctrl.moveTo(ctrl._moveTo.x, ctrl._moveTo.y, timestamp)
		}

	} catch (ex) {
		console.error(`[Event.onEntityUpdatePlayer] "${player.name}" error:`, ex.message || ex || '[no-code]');
	}
}
