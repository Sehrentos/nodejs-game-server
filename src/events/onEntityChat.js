import { ENTITY_TYPE } from "../enum/Entity.js";
import { updateChat } from "../Packets.js";

/**
 * Chat commands available in the game
 * @type {Object<string, (control:import("../control/EntityControl.js").EntityControl, data:import("../Packets.js").TChatPacket, params:string[]) => void>}
 */
const CMD = {};

/**
 * Handles the chat message received from the player.
 * Constructs a chat packet and sends it to the appropriate recipient.
 * If the recipient is specified as 'world' or empty, broadcasts the message
 * to all players in the world. Otherwise, attempts to find the specific player
 * and send the message to them directly.
 *
 * @param {import("../models/Entity.js").Entity} player
 * @param {import("../Packets.js").TChatPacket} json - The JSON object containing chat details.
 */
export function onEntityChat(player, json) {
    if (json.message === "") return;
    const packet = updateChat(json.channel, player.name, json.to, json.message)

    // is message custom command format
    if (packet.message.startsWith("/")) {
        return onChatCommand(player.control, packet)
    }

    // send to world channel
    if (json.channel === '' || json.channel === 'default') {
        return player.control.broadcast(JSON.stringify(packet));
    }

    // send to specific player name
    player.control.world.maps.forEach((map) => {
        map.entities.forEach((entity) => {
            if (entity.name === json.to && entity.type === ENTITY_TYPE.PLAYER) {
                entity.control.socket.send(JSON.stringify(packet));
            }
            // implement send failed message, when receiving player was not found
        })
    })
}

/**
 * Event called when player entity sent chat command e.g. `"/changename MyNewName"`
 * 
 * @param {import("../control/EntityControl.js").EntityControl} control - the entity controller
 * @param {import("../Packets.js").TChatPacket} data - the chat packet data
 */
function onChatCommand(control, data) {
    const parts = data.message.split(' '); // "/command param1 param2"
    const command = parts[0]; // "/command"
    const params = parts.slice(1); // ["param1", "param2"]
    const cmd = CMD[command];

    if (typeof cmd === "function") {
        cmd(control, data, params);
    } else {
        console.log(`[Event.onChatCommand] unknown command. from: ${data.from} message: ${data.message}`)
    }
}

// #region commands

CMD['/help'] = (control, data, params) => {
    const packet = updateChat(
        'default',
        'Server',
        control.entity.name,
        `Available commands: ${Object.keys(CMD).join(', ')}`
    );
    control.socket.send(JSON.stringify(packet));
}

CMD['/changename'] = async (control, data, params) => {
    try {
        const name = params.join(' ');
        const entityId = control.entity.id
        const { affectedRows } = await control.world.db.player.setName(entityId, name)
        if (affectedRows > 0) {
            control.entity.name = name
        } else {
            console.log(`[Event.onChatCommand] error changing name.`)
        }
    } catch (error) {
        console.log(`[Event.onChatCommand] error changing name.`, error)
    }
}

CMD['/changemap'] = async (control, data, params) => {
    try {
        // "<map name with possible space> <x> <y>"
        const matches = params.join(' ').match(/^([a-zA-Z0-9 -_']{1,100})\s([0-9]{1,4})\s([0-9]{1,4})$/)
        if (!matches) {
            console.log(`[Event.onChatCommand] invalid params`)
            return
        }
        const mapName = matches[1]
        const mapX = Number(matches[2] || -1)
        const mapY = Number(matches[3] || -1)
        const entity = control.entity
        // check map exists
        const map = control.world.maps.find(m => m.name === mapName)
        if (!map) {
            console.log(`[Event.onChatCommand] map "${mapName}" not found.`)
            return
        }
        map.world.joinMapByName(entity, mapName, mapX, mapY)
    } catch (error) {
        console.log(`[Event.onChatCommand] error changing map.`, error.message)
    }
}

// #endregion
