import { ENTITY_AUTO_REVIVE_TIME } from "../../../shared/Constants.js"

/**
 * **Monster** Server update tick callback. Used to do animations etc.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} mob
 * @param {number} timestamp
 */
export default function onEntityUpdateMonster(mob, timestamp) {
    try {
        const ctrl = mob.control

        // check if entity is alive
        if (mob.hp <= 0) {
            // when entity has been dead for a x-minutes, revive it
            // and move it to the original position
            if (timestamp - mob.death > ENTITY_AUTO_REVIVE_TIME) {
                ctrl.revive()
                ctrl.toSavePosition()
            } else {
                return // wait for revive
            }
        }

        // call AI onUpdate, if it exists
        ctrl.ai.onUpdate(timestamp)

    } catch (ex) {
        console.error(`[Event.onEntityUpdateMonster] ${mob.gid} error:`, ex.message || ex || '[no-code]');
    }
}
