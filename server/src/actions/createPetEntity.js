import { getMobById } from "../../../shared/data/MOBS.js"
import { TYPE } from "../../../shared/enum/Entity.js"
import { Entity } from "../../../shared/models/Entity.js"
import { AIPet } from "../control/AIPet.js"
import { EntityControl } from "../control/EntityControl.js"
import { sendMapNewEntity } from "../events/sendMap.js"
import createGameId from "../utils/createGameId.js"

/**
 * Creates a new pet entity based on the given mobId, and adds it to the world.
 * The pet entity is owned by the given entity, and is added to the entity's list of pets.
 *
 * @param {Entity} entity - The entity which owns the pet.
 * @param {number[]} mobId - The ID of the mob to spawn as the pet.
 * @returns {Entity[]} The created pet entity, or undefined if mobId not found.
 */
export function createPetEntity(entity, ...mobId) {
	// Get the world and map that the entity is currently in
	const world = entity.control.world
	const map = entity.control.map
	const pets = []

	for (const id of mobId) {
		// Get the mob data for the given mobId
		const monster = getMobById(id, false)

		// If the mobId is not found, return undefined
		if (monster == null) {
			console.warn(`[createPetEntity] Mob id:${mobId} not found`)
			continue
		}

		// Create a new entity based on the monster data
		const pet = new Entity({
			// Copy the monster data
			...monster,
			// Set the pet's ID to a new game ID
			gid: createGameId(),
			// Set the pet's type to PET
			type: TYPE.PET,
			// Set the pet's name to something like "John's Dog"
			name: `${entity.name}'s ${monster.name}`,
			// Set the pet's owner to the given entity
			owner: entity,
			// Set the pet's speed to 25% faster than the owner
			speed: entity.speed * 0.25,
			// Set the pet's last map, X and Y positions to the owner's
			lastMap: entity.lastMap,
			lastX: entity.lastX,
			lastY: entity.lastY,
			// Set the pet's range to 100
			range: 100,
		})

		// Create a new EntityControl for the pet
		pet.control = new EntityControl(pet, world, null, map)

		// Create a new AIPet for the pet
		pet.control.ai = new AIPet(pet)

		// Add the pet to the entity's list of pets
		entity.pets.push(Number(pet.id))

		// Add the pet to the map's list of entities
		map.entities.push(pet)
		pets.push(pet)
	}

	// notify map clients for new entity
	if (pets.length) {
		map.entities.forEach(player => player.control?.socket?.send(sendMapNewEntity(...pets)))
	}

	// Return the created pet entity
	return pets
}
