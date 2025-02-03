/**
 * global game state
 */
export const State = {
    /** @type {import("./control/SocketControl.js").default|null} - WebSocket state */
    socket: null,

    /** @type {import("./entities/Entity.js").default|null} - player entity state */
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