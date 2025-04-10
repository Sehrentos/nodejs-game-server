/**
 * global game state
 */
export const State = {
    /** @type {import("./control/SocketControl.js").default|null} - WebSocket state */
    socket: null,

    /** @type {import("../../shared/models/Entity.js").Entity} - player entity state */
    player: null,

    /** @type {import("../../shared/models/WorldMap.js").WorldMap} - world map state */
    map: null,

    /** @type {Array<import("../../shared/websocket/Packets.js").TChatPacket>} - chat state */
    chat: [{
        type: "chat",
        channel: "default",
        from: "info",
        to: "world",
        message: `Move with WASD or Arrow keys. Press "C" to toggle character info. Type "/help" for commands. Press "Escape" to open exit menu.`,
    }],
}
