import { DIR, TYPE } from "../../../shared/enum/Entity.js"
import { removeEntityFromMaps } from "./removeEntityFromMaps.js"

/**
 * Move the player to a new map.
 * - First, the player's onLeaveMap method is called.
 * - Remove the player from any old maps first.
 * - The player's position is set to (x, y) or the center of the map if the params are negative.
 * - The player's direction is set to 0 (DIRECTION.DOWN).
 * - The player is added to the new map's entities list.
 * - Finally, the player's onEnterMap method is called.
 *
 * @param {import("../../../shared/models/WorldMap.js").WorldMap} map - The map to enter.
 * @param {import("../../../shared/models/Entity.js").Entity} player - The player to enter the map.
 * @param {number} [x=-1] - The x coordinate of the player's position.
 * @param {number} [y=-1] - The y coordinate of the player's position.
 */
export async function addEntityToMap(map, player, x = -1, y = -1) {
	const oldMap = player.control.map
	// entity event
	await player.control.onLeaveMap(map, oldMap)

	// remove player from old map
	removeEntityFromMaps(player)
	// get pets and remove them from old map
	const playerPets = []
	if (oldMap != null) {
		oldMap.entities.forEach(entity => {
			if (entity.type === TYPE.PET && entity.owner.gid === player.gid) {
				playerPets.push(entity)
				removeEntityFromMaps(entity)
			}
		})
	}

	// IMPORTANT: update map controller
	player.control.map = map
	// x/y coords or center of map
	player.lastMap = map.id
	player.lastX = x >= 0 ? x : Math.round(map.width / 2)
	player.lastY = y >= 0 ? y : Math.round(map.height / 2)
	player.dir = DIR.DOWN
	map.entities.push(player)

	// send the pets
	playerPets.forEach(pet => {
		pet.control.map = map
		pet.lastMap = map.id
		pet.lastX = player.lastX
		pet.lastY = player.lastY
		pet.dir = player.dir
		map.entities.push(pet)
	})

	// entity event
	return player.control.onEnterMap(map, oldMap)
}
