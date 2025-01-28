import { Auth } from "../Auth.js";
import Player from "../entities/Player.js";
import WMap from "../entities/WMap.js";
import { SOCKET_URL } from "../Settings.js";
import { State } from "../State.js"
import ChatUI from "../UI/ChatUI.js";
import UINPCDialog from "../UI/UINPCDialog.js";

/**
 * @class SocketControl
 * @description Handles WebSocket controls
 */
export default class SocketControl {
    constructor() {
        // binds methods to the `this` context
        this._onSocketOpen = this.onSocketOpen.bind(this)
        this._onSocketClose = this.onSocketClose.bind(this)
        this._onSocketMessage = this.onSocketMessage.bind(this)

        this._socket = new WebSocket(SOCKET_URL, [
            "ws", "wss", `Bearer.${Auth.jwtToken}`
        ]);

        this._socket.onopen = this._onSocketOpen
        this._socket.onclose = this._onSocketClose
        this._socket.onmessage = this._onSocketMessage

        // update chat list, the UI might not ready yet
        // so set chat message directly
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
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
     */
    get readyState() {
        return this._socket.readyState
    }

    // #endregion

    /**
     * Sends data to the server via WebSocket
     * 
     * @param {string | ArrayBufferLike | Blob | ArrayBufferView} data - The data to send.
     * 
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
     */
    send(data) {
        this._socket.send(data)
    }

    /**
     * Closes the WebSocket connection and removes event listeners.
     * 
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close
     */
    remove() {
        if (this._socket) {
            this._socket.close()
        }
        this._socket.onopen = null
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

        ChatUI.dispatch({
            type: "chat",
            channel: "log",
            from: "client",
            to: "any",
            message: "Socket connected",
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

        ChatUI.dispatch({
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
            const data = JSON.parse(event.data);

            // update player state
            if (data.type === "player") {
                this.updatePlayer(data.player);
                return
            }

            // update map state
            if (data.type === "map") {
                this.updateMap(data.map);
                return
            }

            if (data.type === "chat") {
                this.updateChat(data);
                return
            }

            if (data.type === "npc-dialog") {
                this.updateNPCDialog(data);
                return
            }

            // optional
            if (data.type === "player-leave") {
                console.log(`Player "${data.name}" left the game.`);
                // TODO: update player list, etc?
                return
            }

            console.error("Unknown message:", data);
        } catch (error) {
            console.error("Error parsing socket message:", error);
        }
    }

    // #region handlers

    /**
     * Called when the server sends a player update.
     * 
     * Updates the player state with data received from the server.
     * If a player already exists, it merges the new data into the existing player state.
     * Otherwise, it creates a new player instance with the provided data.
     * Optionally, a custom event can be dispatched to update the player UI.
     *
     * @param {import("../../src/Packets.js").TPlayer} data - The player data from the server.
     */
    updatePlayer(data) {
        // console.log("Player:", data);
        if (State.player instanceof Player) {
            // update player state
            State.player.update(data);
        } else {
            // or create new player if it doesn't exist
            State.player = new Player(data);
        }
        // option 2. update player state and UI by dispatching a custom event
        // document.dispatchEvent(new CustomEvent("ui-character", { detail: data }));
        // next render cycle will update the game
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
     * @param {import("../../src/Packets.js").TWorldMap} data - The map data from the server.
     */
    updateMap(data) {
        // update map state or create new map
        if (State.map instanceof WMap) {
            State.map.update(data)
        } else {
            State.map = new WMap(data)
        }

        // also update some player properties
        // TODO move these into player stats update handler, when/if it's implemented?
        const _player = State.player
        if (_player == null) return

        const _entity = State.map.entities.find(e => e.gid === _player.gid)
        if (_entity) {
            // note: updating these will help with camera and map bounds,
            // since map update is more frequent, than player update (for now).
            _player.lastX = _entity.lastX
            _player.lastY = _entity.lastY
        }
        // next render cycle will update the game
    }

    /**
     * Handles chat updates received from the server.
     * Dispatches a custom "ui-chat" event with the chat data,
     * allowing the chat UI to update accordingly.
     *
     * @param {import("../../src/Packets.js").TChatPacket} data - The chat data from the server.
     */
    updateChat(data) {
        // console.log("Chat:", data);
        ChatUI.dispatch(data);
    }

    /**
     * Handles NPC dialog updates received from the server.
     *
     * @param {import("../../src/Packets.js").TDialogPacket} data - The NPC dialog data from the server.
     */
    updateNPCDialog(data) {
        console.log("NPC Dialog:", data);
        UINPCDialog.dispatch({ gid: data.gid, content: data.dialog, isVisible: true });
    }

    // #endregion handlers
}