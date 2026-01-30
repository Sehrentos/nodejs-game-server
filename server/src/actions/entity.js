import { DIR, TYPE } from "../../../shared/enum/Entity.js"
import { getMobById } from "../../../shared/data/MOBS.js"
import { Entity } from "../../../shared/models/Entity.js"
import { AIPet } from "../control/AIPet.js"
import { EntityControl } from "../control/EntityControl.js"
import { sendMapNewEntity } from "../events/sendMap.js"
import { PLAYER_BASE_HP_REGEN } from "../../../shared/Constants.js"
import { getItemByItemId } from "../../../shared/data/ITEMS.js"
import { SPR_ID } from "../../../shared/enum/Sprite.js"
import { Item } from "../../../shared/models/Item.js"
import { sendChat } from "../events/sendChat.js"
import { sendPlayer } from "../events/sendPlayer.js"
import createGameId from "../utils/createGameId.js"
import DB from "../db/index.js"

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

/**
 *
 * @param {import("../World.js").World} world
 * @param {import("ws").WebSocket} ws
 * @param {import("../../../shared/models/Account.js").Account} account
 * @returns
 */
export async function createPlayerEntity(world, ws, account) {
	// get players count for temp name
	const playersTotalCount = await DB.player.getCount()

	// create new player entity
	// set default values
	const player = new Entity({
		type: TYPE.PLAYER,
		aid: Number(account.id),
		gid: createGameId(), // generate unique id for player
		spriteId: SPR_ID.PLAYER_MALE, // default sprite
		name: `player-${playersTotalCount}`, // initial name
		// saveMap: 1, //'Lobby town',
		// saveX: 875,
		// saveY: 830,
		speed: 20,//ENTITY_MOVE_SPEED / 2,
		hpRecovery: PLAYER_BASE_HP_REGEN,
	})

	// load players data from database
	const players = await DB.player.getByAccountId(account.id) //world.db.player.getByAccountId(account.id)
	console.log(`[World] (${account.id}) account has ${players.length} players. Server has ${playersTotalCount} players.`)

	// create new player if not found
	if (players.length === 0) {
		// Note: insertId can be BigInt or Number in mariaDB
		// JSON.stringify can't convert BigInt, so convert to string
		let insertId = await DB.player.add(player)
		player.id = Number(insertId) // update player id
	} else {
		// merge existing player data from db
		Object.assign(player, players[0])
	}

	// load inventory items from database
	const items = await DB.inventory.getAll(player.id)
	// set player inventory items
	player.inventory = items.map(item => {
		return new Item(Object.assign({}, getItemByItemId(item.id), item))
	})

	// set player controller
	// Note: control.map will be set in onEnterMap
	player.control = new EntityControl(player, world, ws)
	console.log(`[World] Player "${player.name}" (id:${player.id} aid:${player.aid} lastLogin:${player.lastLogin}) connection established.`)
	ws.send(sendPlayer(player))

	// make the player join map and update entity map property
	const map = await world.changeMap(
		player,
		player.lastMap || 1, //Lobby town
		player.lastX || -1,
		player.lastY || -1
	)
	if (map == null) {
		console.log('[World] Error loading map for player', player.name, player.aid)
		ws.close(4401, 'Server error')
		return
	}
	// send welcome message
	ws.send(sendChat(
		'default',
		'Server',
		player.name,
		`Welcome to the server, ${player.name}! You are in "${map.name}".`
	));

	// TODO load pets from database and set player.pets = [1,2,3]
	// then load the pets entities after player is added to the map
	// createPetEntity(player, 18) // TODO improve, test only (Dallas)
	createPetEntity(player, 19) // TODO improve, test only (Santtu)

	return player
}
