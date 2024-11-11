/**
 * global game state
 */
export const State = {
    /** @type {WebSocket|null} - WebSocket state */
    socket: null,

    /** @type {import("./entities/Player.js").default|null} - player state*/
    player: null,

    /** @type {import("./entities/WMap.js").default} - world map state */
    map: null,

    /** @type {Array<import("../src/Packets.js").TChatPacket>} - chat state */
    chat: [{
        type: "chat",
        channel: "default",
        from: "info",
        to: "world",
        message: `Move with WASD or Arrow keys. Press "C" to toggle character info.`,
    }],
}