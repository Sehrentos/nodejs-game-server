import { Auth } from "../Auth.js";
import { Entity } from "../../../shared/models/Entity.js";
import { WorldMap } from "../../../shared/models/WorldMap.js";
import { SOCKET_URL } from "../Settings.js";
import { State } from "../State.js"
import ChatUI from "../UI/ChatUI.js";
import UINPCDialog from "../UI/UINPCDialog.js";
import CharacterUI from "../UI/CharacterUI.js";

/**
 * @class SocketControl
 * @description Handles WebSocket controls
 */
export default class SocketControl {
	constructor() {
		// binds methods to the `this` context
		this._onSocketOpen = this.onSocketOpen.bind(this)
		this._onSocketClose = this.onSocketClose.bind(this)
		this._onSocketError = this.onSocketError.bind(this)
		this._onSocketMessage = this.onSocketMessage.bind(this)

		this._socket = new WebSocket(SOCKET_URL, [
			"ws", "wss", `Bearer.${Auth.jwtToken}`
		]);

		this._socket.onopen = this._onSocketOpen
		this._socket.onclose = this._onSocketClose
		this._socket.onerror = this._onSocketError
		this._socket.onmessage = this._onSocketMessage

		// Entity.latency is updated in server side
		// this._onSocketHeartbeat = setInterval(this.onSocketHeartbeat.bind(this), SOCKET_HEARTBEAT_INTERVAL)

		// update chat list, the UI might not be ready yet
		// set chat message directly
		State.chat.push({
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket connecting",
			timestamp: Date.now(),
		});
	}

	// #region getters

	/**
	 * Returns the WebSocket instance.
	 * @returns {WebSocket} The WebSocket instance.
	 */
	get instance() {
		return this._socket
	}

	/**
	 * Retrieves the current state of the WebSocket connection.
	 *
	 * @returns {number} The ready state of the WebSocket connection as defined by the WebSocket API.
	 */
	get readyState() {
		return this._socket.readyState
	}

	// #endregion

	/**
	 * Sends data to the server via WebSocket
	 * @param {string | ArrayBufferLike | Blob | ArrayBufferView} data - The data to send.
	 */
	send(data) {
		if (this._socket != null && this._socket.readyState === WebSocket.OPEN) {
			this._socket.send(data)
		}
	}

	/**
	 * Closes the WebSocket connection and removes event listeners.
	 */
	remove() {
		if (this._socket) {
			this._socket.close()
		}
		// clearInterval(this._onSocketHeartbeat)
		this._socket.onopen = null
		this._socket.onerror = null
		this._socket.onclose = null
		this._socket.onmessage = null
	}

	/**
	 * Called when the WebSocket connection is opened.
	 * Sends a message to the chat log when the socket is connected.
	 * @param {Event} event - The WebSocket open event.
	 */
	onSocketOpen(event) {
		console.log('Socket connection opened.');

		ChatUI.emit({
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket connected",
			timestamp: Date.now(),
		})
	}

	/**
	 * Handles WebSocket error events.
	 * Note: websocket does not expose any message, so we can't log it.
	 * @param {Event} event - The WebSocket error event.
	 */
	onSocketError(event) {
		console.error('Socket error:', event);

		ChatUI.emit({
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket error in connection establishment",
			timestamp: Date.now(),
		})
	}

	/**
	 * Called when the WebSocket connection is closed.
	 * Logs a message to the console and dispatches a chat event to update the UI.
	 * @param {CloseEvent} event - The WebSocket close event.
	 */
	onSocketClose(event) {
		console.log('Socket connection closed.');

		ChatUI.emit({
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket closed",
			timestamp: Date.now(),
		})
	}

	/**
	 * Handles incoming WebSocket messages.
	 *
	 * Parses the incoming message data and determines the type of message.
	 * Based on the message type, it calls the appropriate update method to
	 * handle player updates, map updates, chat messages, or NPC dialogs.
	 * Logs a message when a player leaves the game and handles unknown message
	 * types by logging an error. Catches and logs any errors that occur during
	 * message parsing.
	 *
	 * @param {MessageEvent} event - The WebSocket message event containing data from the server.
	 */
	onSocketMessage(event) {
		try {
			// TODO : handle receiving binary data instead JSON string
			// Check if the received data is an ArrayBuffer (binary data)
			if (event.data instanceof ArrayBuffer) {
				const receivedBuffer = event.data;
				const view = new DataView(receivedBuffer);

				// Ensure buffer is long enough for at least the header
				if (view.byteLength < 1) {
					console.error("Received buffer too small for header.");
					return;
				}

				// Read the header byte (at offset 0)
				const header = view.getUint8(0);

				// Check the header value
				switch (header) {
					case 0x21: // Our defined Timestamp Header (example)
						// Check if the buffer is the expected length for this type
						if (view.byteLength !== 9) { // 1 byte header + 8 bytes timestamp
							console.error("Received timestamp packet with incorrect length:", view.byteLength);
							return;
						}
						try {
							// Read the timestamp (Float64 BE) starting from OFFSET 1
							const receivedTimestamp = view.getFloat64(1, false); // false = Big Endian
							const receivedDate = new Date(receivedTimestamp);
							console.log("Received Timestamp Packet:", receivedTimestamp, receivedDate.toISOString());
							// Process the timestamp...
						} catch (e) {
							console.error("Error reading timestamp payload:", e);
						}
						break;

					case 0xAB: // Example: Another packet type
						console.log("Received Another Packet Type (0xAB)");
						// Process differently...
						break;

					default:
						console.warn("Received packet with unknown header:", header);
				}
				return;
			}

			// non-binary data
			const data = JSON.parse(event.data);

			// heartbeat (ping/pong)
			if (data.type === "ping") {
				return this.onPing(data);
			}

			// if (data.type === "pong") {
			//     return this.onPong(data);
			// }

			// rate limiter client send too many messages in short time
			if (data.type === "rate-limited") {
				return console.log(`[${data.type}]: ${data.message}`)
			}

			// update player state
			if (data.type === "player") {
				return this.onUpdatePlayer(data.player);
			}

			// update map state
			if (data.type === "map") {
				return this.onUpdateMap(data.map);
			}

			if (data.type === "chat") {
				return this.onUpdateChat(data);
			}

			if (data.type === "npc-dialog") {
				return this.onUpdateNPC(data);
			}

			// optional
			if (data.type === "player-leave") {
				return console.log(`Player "${data.name}" left the game.`);
			}

			console.log("Unknown message:", data);
		} catch (error) {
			console.error("Error parsing socket message:", error);
		}
	}

	// #region handlers

	// /**
	//  * Called every {@link SOCKET_HEARTBEAT_INTERVAL} milliseconds to send a "ping"
	//  * packet to the server, to measure latency and keep the connection alive.
	//  */
	// onSocketHeartbeat() {
	//     /** @type {import("../../src/Packets.js").THeartbeatPacket} */
	//     const packet = { type: "ping", timestamp: performance.now() }
	//     this.send(JSON.stringify(packet));
	// }

	/**
	 * Called when the server sends a "ping" packet.
	 *
	 * Responds to the server with a "pong" packet to measure latency.
	 *
	 * @param {import("../../../shared/websocket/Packets.js").THeartbeatPacket} data - The "ping" packet received from the server.
	 */
	onPing(data) {
		// return the timestamp back to the server
		/** @type {import("../../../shared/websocket/Packets.js").THeartbeatPacket} */
		const packet = { type: "pong", timestamp: data.timestamp };
		this.send(JSON.stringify(packet));
	}

	// no need for client-side latency, Entity.lantency is updated in server side
	// /**
	//  * Called when the server sends a "pong" packet back to the client.
	//  *
	//  * calculate the client-side latency
	//  *
	//  * @param {import("../../src/Packets.js").THeartbeatPacket} data - The "pong" packet received from the server.
	//  */
	// onPong(data) {
	//     const now = performance.now()
	//     const latency = (now - data.timestamp)

	//     console.log(`Latency: ${latency} ms`);

	//     const player = State.player
	//     if (player != null) {
	//         player.latency = latency
	//         CharacterUI.emit(player);
	//     }
	// }

	/**
	 * Called when the server sends a player update.
	 *
	 * Updates the player state with data received from the server.
	 * If a player already exists, it merges the new data into the existing player state.
	 * Otherwise, it creates a new player instance with the provided data.
	 * Optionally, a custom event can be dispatched to update the player UI.
	 *
	 * @param {import("../../../shared/websocket/Packets.js").TEntity} data - The player data from the server.
	 */
	onUpdatePlayer(data) {
		// console.log("Player:", data);
		// update player state
		if (State.player instanceof Entity) {
			Object.assign(State.player, data) // naive approach
		} else {
			State.player = new Entity(data);
		}
		// update UI by dispatching a custom event
		CharacterUI.emit(data);
		// next canvas render cycle will update the game view
	}

	// TODO does the updatePlayer handler need to be splitted into multiple handlers?
	//   whould it be better?
	//   skills, equipment, inventory, quests for example, does not need to be updated so frequently.
	// TODO implement player stats update handler, for more frequent updates

	/**
	 * Called when the server sends a map update.
	 *
	 * Updates the state of the map from the server data.
	 * If the map is already initialized, it will be updated.
	 * If not, a new map is created.
	 * Also updates player x,y position if the player is found in the map.
	 *
	 * @param {import("../../../shared/websocket/Packets.js").TWorldMap} data - The map data from the server.
	 */
	onUpdateMap(data) {
		// update map state or create new map
		if (State.map instanceof WorldMap) {
			Object.assign(State.map, data) // naive approach
		} else {
			State.map = new WorldMap(data)
		}

		// also update player position
		const player = State.player
		if (player == null) return

		const entity = State.map.entities.find(e => e.gid === player.gid)
		if (entity == null) return

		// note: updating these will help with camera and map bounds,
		// since map update is more frequent, than player update (for now).
		player.lastX = entity.lastX
		player.lastY = entity.lastY

		// next render cycle will update the game
	}

	/**
	 * Handles chat updates received from the server.
	 * Dispatches a custom "ui-chat" event with the chat data,
	 * allowing the chat UI to update accordingly.
	 *
	 * @param {import("../../../shared/websocket/Packets.js").TChatPacket} data - The chat data from the server.
	 */
	onUpdateChat(data) {
		console.log("Chat:", data);
		ChatUI.emit(data);
	}

	/**
	 * Handles NPC dialog updates received from the server.
	 *
	 * @param {import("../../../shared/websocket/Packets.js").TDialogPacket} data - The NPC dialog data from the server.
	 */
	onUpdateNPC(data) {
		console.log("NPC Dialog:", data);
		UINPCDialog.emit({ gid: data.gid, content: data.dialog, isVisible: true });
	}

	// #endregion handlers
}
