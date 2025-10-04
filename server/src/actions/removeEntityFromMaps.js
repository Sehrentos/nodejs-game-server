import { TYPE } from "../../../shared/enum/Entity.js"

/**
 * Removes the given entity and it's pets from the maps
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity - The entity to remove.
 */
export function removeEntityFromMaps(entity, removePets = false) {
	const world = entity.control.world
	for (const map of world.maps) {
		map.entities = map.entities.filter((e) => e.gid !== entity.gid)
		if (removePets) map.entities = map.entities.filter((e) => e.type !== TYPE.PET || e.owner.gid !== entity.gid)
	}
}
