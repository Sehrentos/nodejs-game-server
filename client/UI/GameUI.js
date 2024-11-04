import m from "mithril"
import CharacterUI from "./CharacterUI.js"
import ChatUI from "./ChatUI.js"
import CanvasUI from "./CanvasUI.js"
import Player from "../entities/Player.js"
import { Auth } from "../Auth.js"
import WMap from "../entities/WMap.js"
import { State } from "../State.js"

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
			m(ChatUI)
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
		State.socket = new WebSocket(State.socketUrl, [
			"ws", "wss", `Bearer.${Auth.jwtToken}`
		]);
		ChatUI.addChat({
			type: "chat",
			from: "client",
			to: "user",
			message: "Socket connecting",
		});

		this.addEvents();
	}

	/**
	 * Called when the Mithril component is removed.
	 * 
	 * This removes the WebSocket connection and the events from the component.
	 */
	onremove() {
		if (State.socket) {
			State.socket.close()
		}

		// do unbindings etc.
		State.player?.onRemove()

		this.removeEvents()

		// this.uiCanvas = null
		// this.uiCharacter = null
		// this.uiChat = null
	}

	// #endregion

	// #region events

	addEvents() {
		State.socket.onopen = this._onSocketOpen
		State.socket.onclose = this._onSocketClose
		State.socket.onmessage = this._onSocketMessage
	}

	removeEvents() {
		// WebSocket
		State.socket.onopen = null
		State.socket.onclose = null
		State.socket.onmessage = null
	}

	onSocketOpen(event) {
		console.log('Socket connection opened.');
		ChatUI.addChat({
			type: "chat",
			from: "client",
			to: "user",
			message: "Socket connected",
		});
	}

	onSocketClose(event) {
		console.log('Socket connection closed.');
		ChatUI.addChat({
			type: "chat",
			from: "client",
			to: "user",
			message: "Socket closed",
		});
	}

	onSocketMessage(event) {
		try {
			const data = JSON.parse(event.data);
			if (data.type === "player") {
				this.onPlayerUpdate(data.player);
			} else if (data.type === "map") {
				this.onMapUpdate(data.map);
			} else if (data.type === "chat") {
				this.onChatUpdate(data);
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
	 * 
	 * @param {import("../../src/Packets.js").TPlayer} data 
	 */
	onPlayerUpdate(data) {
		// console.log("Player:", data);
		// update player state
		// or create new player if it doesn't exist
		if (State.player instanceof Player) {
			State.player.update(data);
		} else {
			State.player = new Player(data);
			// invoke creation method to update bindings etc.
			State.player.onCreate()
		}
		// update player UI
		document.dispatchEvent(new CustomEvent("player", { detail: data }));
		// next render cycle will update the game
	}

	/**
	 * 
	 * @param {import("../../src/Packets.js").TWorldMap} data 
	 */
	onMapUpdate(data) {
		// update map state
		//if (this.map instanceof WMap) {
		// TODO possibly merge the changes from server
		// and play entity death animations?
		State.map = new WMap(data)
		if (!State.player) return
		// also update player x,y position
		// TODO client side prediction
		const player = State.map.entities.find(e => e.gid === State.player.gid)
		if (player) {
			State.player.x = player.x
			State.player.y = player.y
		}
		// next render cycle will update the game
	}

	/**
	 * 
	 * @param {import("../../src/Packets.js").TChatPacket} data 
	 */
	onChatUpdate(data) {
		// console.log("Chat:", data);
		// trigger a custom chat event
		// to be caught by the chat UI
		// and displayed in the chat UI
		document.dispatchEvent(new CustomEvent("ui-chat", { detail: data }));
	}

	// #endregion handlers

}