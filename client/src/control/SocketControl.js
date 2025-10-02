import { SOCKET_URL } from "../Settings.js";
import { onPing } from "../events/onPing.js";
import { onUpdatePlayer } from "../events/onUpdatePlayer.js";
import { onNewMapEntity, onRemoveMapEntity, onUpdateMap, onUpdateMapDelta, onUpdateMapEntity } from "../events/onUpdateMap.js";
import { onChat } from "../events/onChat.js";
import { onDialog } from "../events/onDialog.js";
import { onPlayerLeave } from "../events/onPlayerLeave.js";
import { onItemsReceived } from "../events/onItemsReceived.js";
import { onSkillUse } from "../events/onSkillUse.js";
import Events from "../Events.js";

/**
 * @class SocketControl
 * @description Handles WebSocket controls
 */
export default class SocketControl {
	/**
	 * @param {import("../State.js").State} state
	 */
	constructor(state) {
		/** @type {import("../State.js").State} */
		this.state = state
		/** @type {import("../Auth.js").Auth} */
		this.auth = state.auth

		// binds methods to the `this` context
		this._onSocketOpen = this.onSocketOpen.bind(this)
		this._onSocketClose = this.onSocketClose.bind(this)
		this._onSocketError = this.onSocketError.bind(this)
		this._onSocketMessage = this.onSocketMessage.bind(this)

		this._socket = new WebSocket(SOCKET_URL, [
			"ws", "wss", `Bearer.${this.auth.jwtToken.value}`
		]);

		this._socket.onopen = this._onSocketOpen
		this._socket.onclose = this._onSocketClose
		this._socket.onerror = this._onSocketError
		this._socket.onmessage = this._onSocketMessage

		// Entity.latency is updated in server side
		// this._onSocketHeartbeat = setInterval(this.onSocketHeartbeat.bind(this), SOCKET_HEARTBEAT_INTERVAL)

		// update chat list, the UI might not be ready yet
		// set chat message directly
		this.state.chat.set((current) => ([...current, {
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket connecting",
			timestamp: Date.now(),
		}]));
		console.log('SocketControl initialized.', this.state.chat.value);
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
		/** @type {import("../../../server/src/events/sendChat.js").TChatPacket} */
		const chatParams = {
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket connected",
			timestamp: Date.now(),
		}
		// update chat state
		this.state.chat.set((current) => ([...current, chatParams]))
	}

	/**
	 * Handles WebSocket error events.
	 * Note: websocket does not expose any message, so we can't log it.
	 * @param {Event} event - The WebSocket error event.
	 */
	onSocketError(event) {
		console.error('Socket error:', event);

		/** @type {import("../../../server/src/events/sendChat.js").TChatPacket} */
		const chatParams = {
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket error in connection establishment",
			timestamp: Date.now(),
		}
		// Events.emit("ui-chat", chatParams);
		// update chat state
		this.state.chat.set((current) => ([...current, chatParams]))
	}

	/**
	 * Called when the WebSocket connection is closed.
	 * Logs a message to the console and send a chat event to update the UI.
	 * @param {CloseEvent} event - The WebSocket close event.
	 */
	onSocketClose(event) {
		console.log('Socket connection closed.');

		/** @type {import("../../../server/src/events/sendChat.js").TChatPacket} */
		const chatParams = {
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket closed",
			timestamp: Date.now(),
		}
		// Events.emit("ui-chat", chatParams);
		// update chat state
		this.state.chat.set((current) => ([...current, chatParams]))

		Events.emit("ui-dialog-toggle", { id: "socket-connection" })
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
			// TODO (sketch) : handle receiving binary data instead JSON string
			// Check if the received data is an ArrayBuffer (binary data)
			// if (event.data instanceof ArrayBuffer) {
			// 	const receivedBuffer = event.data;
			// 	const view = new DataView(receivedBuffer);

			// 	// Ensure buffer is long enough for at least the header
			// 	if (view.byteLength < 1) {
			// 		console.error("Received buffer too small for header.");
			// 		return;
			// 	}

			// 	// Read the header byte (at offset 0)
			// 	const header = view.getUint8(0);

			// 	// Check the header value
			// 	switch (header) {
			// 		case 0x21: // Our defined Timestamp Header (example)
			// 			// Check if the buffer is the expected length for this type
			// 			if (view.byteLength !== 9) { // 1 byte header + 8 bytes timestamp
			// 				console.error("Received timestamp packet with incorrect length:", view.byteLength);
			// 				return;
			// 			}
			// 			try {
			// 				// Read the timestamp (Float64 BE) starting from OFFSET 1
			// 				const receivedTimestamp = view.getFloat64(1, false); // false = Big Endian
			// 				const receivedDate = new Date(receivedTimestamp);
			// 				console.log("Received Timestamp Packet:", receivedTimestamp, receivedDate.toISOString());
			// 				// Process the timestamp...
			// 			} catch (e) {
			// 				console.error("Error reading timestamp payload:", e);
			// 			}
			// 			break;

			// 		case 0xAB: // Example: Another packet type
			// 			console.log("Received Another Packet Type (0xAB)");
			// 			// Process differently...
			// 			break;

			// 		default:
			// 			console.warn("Received packet with unknown header:", header);
			// 	}
			// 	return;
			// }

			// Message is non-binary data

			// Check if the received data is a string
			if (typeof event.data !== "string") return

			// parse JSON sent from the server
			const data = JSON.parse(event.data);

			if (!data.type) {
				console.log("[SocketControl]: Message has no type");
				return;
			}

			switch (data.type) {
				// heartbeat (ping/pong) for latency measurement
				case "ping":
					onPing(this, data);
					break;

				// player update (all or specific properties)
				case "player":
					onUpdatePlayer(this, data);
					break;

				// update world map state
				case "map":
					onUpdateMap(this, data);
					break;

				// map entity update (all or specific properties)
				case "map-entity":
					onUpdateMapEntity(this, data);
					break;

				// map delta updates
				case "map-update":
					onUpdateMapDelta(this, data);
					break;

				// add new map entity
				case "map-new-entity":
					onNewMapEntity(this, data);
					break;

				// remove map entity
				case "map-remove-entity":
					onRemoveMapEntity(this, data);
					break;

				// chat controls
				case "chat":
					onChat(this, data);
					break;

				// NPC dialog controls
				case "npc-dialog":
				case "npc-dialog-open":
					onDialog(this, data);
					break;

				// optional
				case "player-leave":
					onPlayerLeave(this, data);
					break;

				// receive items
				case "items-received":
					onItemsReceived(this, data);
					break;

				// receive skill
				case "skill":
					onSkillUse(this, data);
					break;

				default:
					console.log("[SocketControl]: Unknown message:", data);
			}
		} catch (error) {
			console.error("Error parsing socket message:", error);
		}
	}
}
