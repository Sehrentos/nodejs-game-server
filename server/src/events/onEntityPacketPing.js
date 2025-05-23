import { sendHeartbeat } from "./sendHeartbeat.js";

/**
 * Handles the "ping" packet sent by the client.
 *
 * Responds with a "pong" packet.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 * @param {import("../../../client/src/events/sendHeartbeat.js").THeartbeatPacket} data
 */
export default function onEntityPacketPing(entity, data) {
	try {
		// check if data is valid
		if (data == null || data.type !== 'ping' && typeof data.timestamp !== "number") {
			return
		}

		// return the timestamp back to the client
		entity.control.socket.send(sendHeartbeat('pong', data.timestamp))

	} catch (ex) {
		console.error(`[Event.onEntityPacketPing] ${entity.gid} error:`, ex.message || ex || '[no-code]');
	}
}
