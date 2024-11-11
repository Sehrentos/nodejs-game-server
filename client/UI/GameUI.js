import m from "mithril"
import "./GameUI.css"
import CharacterUI from "./CharacterUI.js"
import ChatUI from "./ChatUI.js"
import CanvasUI from "./CanvasUI.js"
import Player from "../entities/Player.js"
import { Auth } from "../Auth.js"
import WMap from "../entities/WMap.js"
import { State } from "../State.js"
import DialogUI from "./DialogUI.js"
import { SOCKET_URL } from "../Settings.js"

/**
 * @class GameUI
 * @description Game UI for the game, contains the canvas, character and bindings etc.
 * @exports GameUI
 */
export default class GameUI {
	/**
	 * @param {m.Vnode} vnode 
	 */
	constructor(vnode) {
		// disable text select in UI
		this._onDisableSelectStart = this.onDisableSelectStart.bind(this)

		this._onSocketOpen = this.onSocketOpen.bind(this)
		this._onSocketClose = this.onSocketClose.bind(this)
		this._onSocketMessage = this.onSocketMessage.bind(this)
	}

	/**
	 * View method for the game UI.
	 * 
	 * This method creates the game UI components, such as the canvas, character and chat.
	 * 
	 * @returns {m.Vnode} The game UI vnode.
	 */
	view() {
		return m("main.ui-game",
			m(CanvasUI),
			m(CharacterUI),
			m(ChatUI),
			m(DialogUI),
		)
	}

	// #region Mithril events

	/**
	 * Called when the Mithril component is created.
	 * 
	 * This adds the WebSocket connection and the events to the component.
	 * 
	 * @param {import("mithril").VnodeDOM} vnode - The Mithril vnode.
	 */
	oncreate(vnode) {
		// this.uiCanvas = vnode.dom.querySelector("canvas")
		// this.uiCharacter = vnode.dom.querySelector("div.ui-character")
		// this.uiChat = vnode.dom.querySelector("div.ui-chat")

		// initialize socket
		if (State.socket) State.socket.close()
		State.socket = new WebSocket(SOCKET_URL, [
			"ws", "wss", `Bearer.${Auth.jwtToken}`
		]);

		// update chat UI
		ChatUI.add({
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket connecting",
		});

		// select event
		vnode.dom.addEventListener("selectstart", this._onDisableSelectStart)

		// WebSocket
		State.socket.onopen = this._onSocketOpen
		State.socket.onclose = this._onSocketClose
		State.socket.onmessage = this._onSocketMessage
	}

	/**
	 * Called when the Mithril component is removed.
	 * 
	 * This removes the WebSocket connection and the events from the component.
	 */
	onremove(vnode) {
		if (State.socket) {
			State.socket.close()
		}

		// do unbindings etc.
		if (State.player) {
			State.player.remove()
		}

		// select event
		vnode.dom.removeEventListener("selectstart", this._onDisableSelectStart)

		// WebSocket
		State.socket.onopen = null
		State.socket.onclose = null
		State.socket.onmessage = null

		// this.uiCanvas = null
		// this.uiCharacter = null
		// this.uiChat = null
	}

	// #endregion

	// #region events

	/**
	 * Disable text selection in the game UI.
	 * 
	 * @param {Event} event - The selectstart event.
	 */
	onDisableSelectStart(event) {
		event.preventDefault()
	}

	onSocketOpen(event) {
		// console.log('Socket connection opened.');
		ChatUI.add({
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket connected",
		});
	}

	onSocketClose(event) {
		// console.log('Socket connection closed.');
		ChatUI.add({
			type: "chat",
			channel: "log",
			from: "client",
			to: "any",
			message: "Socket closed",
		});
		document.dispatchEvent(new CustomEvent("ui-dialog", {
			detail: "Socket connection closed."
		}));
	}

	onSocketMessage(event) {
		try {
			const data = JSON.parse(event.data);
			if (data.type === "player") {
				this.updatePlayer(data.player);
			} else if (data.type === "map") {
				this.updateMap(data.map);
			} else if (data.type === "chat") {
				this.updateChat(data);
			} else if (data.type === "npc-dialog") {
				this.updateNPCDialog(data);
			} else {
				console.error("Unknown message:", data);
			}
		} catch (error) {
			console.error("Websocket message error:", error);
		}
	}

	// #endregion events

	// #region handlers

	/**
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
		// option 2. update player UI by dispatching a custom event
		// document.dispatchEvent(new CustomEvent("ui-character", { detail: data }));
		// next render cycle will update the game
	}

	/**
	 * Called when the server sends a map update.
	 * Updates the state of the map from the server data.
	 * If the map is already initialized, it will be updated.
	 * If not, a new map is created.
	 * Also updates player x,y position if the player is found in the map.
	 * Players are also entity and map will keep track of them.
	 * @param {import("../../src/Packets.js").TWorldMap} data - The map data from the server.
	 */
	updateMap(data) {
		// update map state
		//if (this.map instanceof WMap) {
		// TODO possibly merge the changes from server
		// and play entity death animations?
		State.map = new WMap(data)
		// if (!State.player) return
		// also update player x,y position?
		// TODO client side prediction
		// const player = State.map.entities.find(e => e.gid === State.player.gid)
		// if (player) {
		// 	State.player.x = player.x
		// 	State.player.y = player.y
		// }
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
		// trigger a custom chat event
		// to be caught by the chat UI
		document.dispatchEvent(new CustomEvent("ui-chat", { detail: data }));
	}

	/**
	 * Handles NPC dialog updates received from the server.
	 * Prints the dialog data to the console (for now).
	 *
	 * @param {import("../../src/Packets.js").TDialogPacket} data - The NPC dialog data from the server.
	 */
	updateNPCDialog(data) {
		console.log("NPC Dialog:", data);
		document.dispatchEvent(new CustomEvent("ui-dialog", { detail: data.dialog }));
	}

	// #endregion handlers

}