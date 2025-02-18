import { COOLDOWN_SOCKET_SEND_MAP, COOLDOWN_SOCKET_SEND_PLAYER } from "../Constants.js";
import { updateMap, updatePlayer } from "../Packets.js";

/**
 * **Player** Server update tick callback. Used to send updates to the client.
 * 
 * @param {import("../models/Entity.js").Entity} player
 * @param {number} timestamp
 */
export default function onEntityUpdatePlayer(player, timestamp) {
    try {
        const ctrl = player.control
        const map = ctrl.map

        // update client map data,
        // so the client can update the map with new entity positions
        if (ctrl._socketSentMapUpdateCd.isExpired(timestamp) && map != null) {
            ctrl._socketSentMapUpdateCd.set(timestamp + COOLDOWN_SOCKET_SEND_MAP)
            ctrl.socket.send(JSON.stringify(updateMap(player, map)));
        }

        // send full player state update every x seconds
        // send packet to client, containing player data
        if (ctrl._socketSentPlayerUpdateCd.isExpired(timestamp)) {
            ctrl._socketSentPlayerUpdateCd.set(timestamp + COOLDOWN_SOCKET_SEND_PLAYER)
            ctrl.socket.send(JSON.stringify(updatePlayer(player)));
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
