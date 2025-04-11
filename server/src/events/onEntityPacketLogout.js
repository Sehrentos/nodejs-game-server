/**
 * Handles the "ping" packet sent by the client.
 *
 * Responds with a "pong" packet.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity
 * @param {import("../../../client/src/events/sendLogout.js").TPlayerLogoutPacket} data - logout packet from client
 * @param {number} timestamp
 */
export default async function onEntityPacketLogout(entity, data, timestamp) {
	try {
		const ctrl = entity.control;

		// save player state
		// Note: player save handler is the World.onClientClose
		// let { affectedRows } = await ctrl.world.db.player.update(entity);
		// console.log(`[World] logout player (id:${entity.id}) "${entity.name}" is ${affectedRows > 0 ? 'saved' : 'not saved'}.`);

		// remove JWT token from database, since this is logout request
		await ctrl.world.db.account.logout(entity.aid, true);

		// disconnect
		entity.control.socket.close();

	} catch (ex) {
		console.error(`[Event.onEntityPacketLogout] ${entity.gid} logout error:`, ex.message || ex || '[no-code]');
	}
}
