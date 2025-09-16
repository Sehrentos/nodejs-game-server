import EventEmitter from "./utils/EventEmitter.js";
import Observable from "./utils/Observable.js";

/**
 * Global event emitter for client-side events.
 * Used for communication between different parts of the client application.
 */
export const Events = new EventEmitter();

/**
 * Global game state
 */
export const State = {
	/** @type {import("./control/SocketControl.js").default|null} - WebSocket state */
	socket: null,

	/** @type {Observable<null|import("../../shared/models/Entity.js").Entity>} - player entity state */
	player: new Observable(null),

	/** @type {Observable<null|import("../../shared/models/WorldMap.js").WorldMap>} - world map state */
	map: new Observable(null),

	/** @type {Observable<Array<import("../../server/src/events/sendChat.js").TChatPacket>>} - chat state */
	chat: new Observable([{
		type: "chat",
		channel: "default",
		from: "info",
		to: "world",
		message: `Move with WASD or Arrow keys. Press "C" to toggle character info. Type "/help" for commands. Press "Escape" to open exit menu.`,
		timestamp: Date.now()
	}]),
}

