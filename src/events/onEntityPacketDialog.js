const TAG = '[Event.onEntityCloseDialog]';

/**
 * Handles the NPC interaction dialog packets received from the server. These are sent by the client.
 * - Player started interacting with the NPC.
 * - Player next article.
 * - Player stopped interacting with the NPC.
 * 
 * @param {import("../models/Entity.js").Entity} entity
 * @param {import("../Packets.js").TDialogResponsePacket} data
 * @param {number} timestamp - The current timestamp or performance.now().
 */
export default function onEntityPacketDialog(entity, data, timestamp) {
    try {
        const ctrl = entity.control

        switch (data.action) {
            case 'open':
                console.log(`${TAG} "${entity.name}" started interacting with NPC (gid: ${data.gid})`)
                ctrl.isMovementBlocked = true
                break;

            case 'next':
                console.log(`${TAG} "${entity.name}" next article (gid: ${data.gid})`)
                break;

            case 'close':
                console.log(`${TAG} "${entity.name}" stopped interacting with NPC (gid: ${data.gid})`)
                // TODO make sure player is next to the NPC, before allowing movement
                // this is a server side check
                ctrl.isMovementBlocked = false
                break;

            default:
                console.log(`${TAG} unknown action: ${data.action}`)
                break;
        }
    } catch (ex) {
        console.error(`${TAG} ${entity.gid} error:`, ex.message || ex || '[no-code]');
    }
}
