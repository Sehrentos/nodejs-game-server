import { ENTITY_TYPE } from "../../../shared/enum/Entity.js";
import { REGEX_BLACKLIST_PLAYER_NAMES } from "../../../shared/Constants.js";
import { sendChat } from "./sendChat.js";

/**
 * Chat commands available in the game
 * @type {Object<string, (entity:import("../../../shared/models/Entity.js").Entity, data:import("../../../client/src/events/sendChat.js").TChatPacket, params:string[]) => void>}
 */
const CMD = {};

/**
 * Handles the chat message received from the player.
 * Constructs a chat packet and sends it to the appropriate recipient.
 * If the recipient is specified as 'world' or empty, broadcasts the message
 * to all players in the world. Otherwise, attempts to find the specific player
 * and send the message to them directly.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} player
 * @param {import("../../../client/src/events/sendChat.js").TChatPacket} json - The chat packet from the client.
 * @param {number} timestamp - The current timestamp or performance.now().
 */
export default function onEntityPacketChat(player, json, timestamp) {
	if (json.message === "") return;

	// is message custom command format
	if (json.message.startsWith("/")) {
		return onChatCommand(player, json, timestamp)
	}

	const packet = sendChat(json.channel, player.name, json.to, json.message)

	// send to world channel
	if (json.channel === '' || json.channel === 'default') {
		return player.control.broadcast(packet);
	}

	// send to specific player name
	player.control.world.maps.forEach((map) => {
		map.entities.forEach((entity) => {
			if (entity.name === json.to && entity.type === ENTITY_TYPE.PLAYER) {
				entity.control.socket.send(packet);
			}
			// implement send failed message, when receiving player was not found
		})
	})
}

/**
 * Event called when player entity sent chat command e.g. `"/changename MyNewName"`
 *
 * @param {import("../../../shared/models/Entity.js").Entity} entity - the entity
 * @param {import("../../../client/src/events/sendChat.js").TChatPacket} data - the chat packet data
 * @param {number} timestamp - the timestamp
 */
function onChatCommand(entity, data, timestamp) {
	const parts = data.message.split(' '); // "/command param1 param2"
	const command = parts[0]; // "/command"
	const params = parts.slice(1); // ["param1", "param2"]
	const cmd = CMD[command];

	if (typeof cmd === "function") {
		cmd(entity, data, params);
	} else {
		console.log(`[Event.onChatCommand] unknown command. from: ${data.from} message: ${data.message}`)
	}
}

// #region commands

CMD['/help'] = (entity, data, params) => {
	entity.control.socket.send(sendChat(
		'default',
		'Server',
		entity.name,
		`Available commands: ${Object.keys(CMD).join(', ')}`
	));
}

// save position in the current map
CMD['/save'] = async (entity, data, params) => {
	try {
		const ctrl = entity.control
		// check current map is town
		// if (!/(\stown|\svillage)/i.test(ctrl.map.name)) {
		if (!ctrl.map.isTown) {
			ctrl.socket.send(sendChat("default", "Server", entity.name, "You can only save position in towns."))
			return
		}
		entity.saveMap = entity.lastMap
		entity.saveX = entity.lastX
		entity.saveY = entity.lastY

		ctrl.socket.send(sendChat("default", "Server", entity.name, "Position saved."))

	} catch (error) {
		console.log(`[Event.onChatCommand] error changing name.`, error)
	}
}

CMD['/changename'] = async (entity, data, params) => {
	try {
		const ctrl = entity.control
		const name = params.join(' ');

		// blacklist validation for names
		if (REGEX_BLACKLIST_PLAYER_NAMES.test(name)) {
			ctrl.socket.send(sendChat("default", "Server", entity.name, "Change name failed."))
			return
		}

		const { affectedRows } = await ctrl.world.db.player.setName(entity.id, name)
		if (!affectedRows) {
			ctrl.socket.send(sendChat("default", "Server", entity.name, "Change name failed."))
			return
		}

		// success
		entity.name = name
		ctrl.socket.send(sendChat("default", "Server", entity.name, "Change name success."))

	} catch (error) {
		console.log(`[Event.onChatCommand] error changing name.`, error)
	}
}

CMD['/changemap'] = async (entity, data, params) => {
	try {
		const ctrl = entity.control
		// "<map name or id> <x> <y>"
		const matches = params.join(' ').match(/^([a-zA-Z0-9 -_']{1,100})\s([0-9]{1,4})\s([0-9]{1,4})$/)
		if (!matches) {
			ctrl.socket.send(sendChat("default", "Server", entity.name, "Change map invalid format. Use <mapname|mapid> <x> <y>"))
			return
		}
		const mapNameOrId = matches[1]
		const mapX = Number(matches[2] || -1)
		const mapY = Number(matches[3] || -1)
		// check map exists
		const map = ctrl.world.maps.find(m => m.name === mapNameOrId || m.id === parseInt(mapNameOrId))
		if (!map) {
			ctrl.socket.send(sendChat("default", "Server", entity.name, `The map "${mapNameOrId}" does not exist.`))
			return
		}
		map.world.joinMap(entity, mapNameOrId, mapX, mapY)
	} catch (error) {
		console.log(`[Event.onChatCommand] error changing map.`, error.message)
	}
}

// TODO implement disguise command to show different sprite
CMD['/disguise'] = async (entity, data, params) => {
	try {
		const ctrl = entity.control
		const name = params.join(' ');
		const sprite = name === '' ? 0 : parseInt(name, 10);
		if (isNaN(sprite) || sprite < 0 || sprite > 100) {
			ctrl.socket.send(sendChat("default", "Server", entity.name, "Disguise invalid format. Use /disguise <spriteId>"))
			return
		}
		entity.spriteId = sprite
		ctrl.socket.send(sendChat("default", "Server", entity.name, `Disguise changed to spriteId:${sprite}`))
	} catch (error) {
		console.log(`[Event.onChatCommand] error changing disguise.`, error)
	}
}

// #endregion
