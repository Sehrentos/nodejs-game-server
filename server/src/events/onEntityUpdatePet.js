import { ENTITY_AUTO_REVIVE_TIME } from "../../../shared/Constants.js"

/**
 * **Pet** Server update tick callback. Used to do animations etc.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} pet
 * @param {number} timestamp
 */
export default function onEntityUpdatePet(pet, timestamp) {
	try {
		const ctrl = pet.control

		// // check if entity is alive
		// if (pet.hp <= 0) {
		// 	// when entity has been dead for a x-minutes, revive it
		// 	// and move it to the original position
		// 	if (timestamp - pet.death > ENTITY_AUTO_REVIVE_TIME) {
		// 		ctrl.revive()
		// 		ctrl.toSavePosition()
		// 	} else {
		// 		return // wait for revive
		// 	}
		// }

		// call AI onUpdate, if it exists
		ctrl.ai.onUpdate(timestamp)

	} catch (ex) {
		console.error(`[Event.onEntityUpdatePet] ${pet.gid} error:`, ex.message || ex || '[no-code]');
	}
}
