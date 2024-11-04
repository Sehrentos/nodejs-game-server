/**
 * global game state
 */
export const State = {
    /** @type {number} - FPS limit */
    fpsLimit: 60/2,

    /** @type {string} - WebSocket address */
    socketUrl: "wss://127.0.0.1:3000/world",

    /** @type {WebSocket|null} - WebSocket state */
    socket: null,

    /** @type {import("./entities/Player.js").default|null} - player state*/
    player: null,

    /** @type {import("./entities/WMap.js").default} - world map state */
    map: null,

    /** @type {Array<import("../src/Packets.js").TChatPacket>} - chat state */
    chat: [],
}