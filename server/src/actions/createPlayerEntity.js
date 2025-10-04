import { PLAYER_BASE_HP_REGEN } from "../../../shared/Constants.js"
import { getItemByItemId } from "../../../shared/data/ITEMS.js"
import { TYPE } from "../../../shared/enum/Entity.js"
import { SPR_ID } from "../../../shared/enum/Sprite.js"
import { Entity } from "../../../shared/models/Entity.js"
import { Item } from "../../../shared/models/Item.js"
import { EntityControl } from "../control/EntityControl.js"
import { sendChat } from "../events/sendChat.js"
import { sendPlayer } from "../events/sendPlayer.js"
import createGameId from "../utils/createGameId.js"
import { createPetEntity } from "./createPetEntity.js"

/**
 *
 * @param {import("../World.js").World} world
 * @param {import("ws").WebSocket} ws
 * @param {import("../../../shared/models/Account.js").Account} account
 * @returns
 */
export async function createPlayerEntity(world, ws, account) {
	// get players count for temp name
	const playersTotalCount = await world.db.player.count()

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
	const players = await world.db.player.getByAccountId(account.id)
	console.log(`[World] (${account.id}) account has ${players.length} players. Server has ${playersTotalCount} players.`)

	// create new player if not found
	if (players.length === 0) {
		// Note: insertId can be BigInt or Number
		// JSON.stringify can't convert BigInt, so convert to string
		let { insertId } = await world.db.player.add(player)
		player.id = Number(insertId) // update player id
	} else {
		// merge existing player data from db
		Object.assign(player, players[0])
	}

	// load inventory items from database
	const items = await world.db.inventory.getItems(player.id)
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
