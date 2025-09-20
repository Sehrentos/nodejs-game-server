import { getMobById } from "../../../shared/data/MOBS.js"
import { ENTITY_TYPE } from "../../../shared/enum/Entity.js"
import { Entity } from "../../../shared/models/Entity.js"
import { AIPet } from "../control/AIPet.js"
import { EntityControl } from "../control/EntityControl.js"
import createGameId from "../utils/createGameId.js"

/**
 * Add a pet entity to the world, owned by the given entity.
 *
 * @param {Entity} entity
 * @param {number} mobId
 * @returns {Entity|undefined} the created pet entity, or undefined if mobId not found
 */
export default function addPet(entity, mobId) {
	const world = entity.control.world
	const map = entity.control.map
	const monster = getMobById(mobId, false)

	if (monster == null) {
		console.warn(`[addPet] Mob id:${mobId} not found`)
		return
	}

	// copy the entity and set as pet
	const pet = new Entity({
		...monster,
		gid: createGameId(),
		type: ENTITY_TYPE.PET,
		name: `${entity.name}'s ${monster.name}`,
		owner: entity,
		speed: entity.speed * 0.25, // set speed 25% faster than owner
		lastMap: entity.lastMap,
		lastX: entity.lastX,
		lastY: entity.lastY,
		range: 100,
	})
	pet.control = new EntityControl(pet, world, null, map)
	pet.control.ai = new AIPet(pet)
	entity.pets.push(Number(pet.id))

	map.entities.push(pet)
	return pet
}
