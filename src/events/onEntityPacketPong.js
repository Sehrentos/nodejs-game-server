// import { heartbeat } from "../Packets.js";

/**
 * Handles the "pong" packet by responding with a "ping" packet.
 * 
 * @param {import("../models/Entity.js").Entity} entity
 * @param {import("../Packets.js").THeartbeatPacket} data
 * @param {number} timestamp
 */
export default function onEntityPacketPong(entity, data, timestamp) {
    try {
        // const now = performance.now()
        // const ctrl = entity.control

        // check if data is valid
        if (data == null || data.type !== 'pong' && typeof data.timestamp !== "number") {
            return
        }
        // calculate latency and set it
        entity.latency = Math.round(timestamp - data.timestamp)

        //console.log(`[Event.onEntityPacketPong] ${entity.gid} latency:`, entity.latency);

    } catch (ex) {
        console.error(`[Event.onEntityPacketPong] ${entity.gid} error:`, ex.message || ex || '[no-code]');
    }
}
