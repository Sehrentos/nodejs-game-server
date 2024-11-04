import m from "mithril"
import { State } from "../State.js"

export default class ChatUI {
	/**
	 * @param {m.Vnode} vnode 
	 */
	constructor(vnode) {
		this.isVisible = true
		// this.messages = State.chat // []

		this._onSubmit = this.onSubmit.bind(this)
		this._onKeydownListener = this.onKeydownListener.bind(this)
		// custom event to update chat state on the UI
		this._onDOMChat = this.onDOMChat.bind(this)
	}
	oncreate(vnode) {
		window.addEventListener("keydown", this._onKeydownListener)
		document.addEventListener("ui-chat", this._onDOMChat)
	}
	onremove(vnode) {
		window.removeEventListener("keydown", this._onKeydownListener)
		document.removeEventListener("ui-chat", this._onDOMChat)
	}
	onupdate(vnode) {
		const _ul = document.querySelector("div.ui-chat ul#chat")
		_ul.scrollTop = _ul.scrollHeight // update scroll position
	}
	view(vnode) {
		return this.isVisible
			? m("div.ui-chat", [
				m("form#chat-form[autocomplete=off]", { onsubmit: this._onSubmit }, [
					m("fieldset", [
						m("legend[tabindex=-1]", "Chat"),
						m("ul#chat", State.chat.map((msg, key) => m("li", { key }, `${msg.from}: ${msg.message}`))),
						m(
							"input#chat-input[type=text][name=chat-input][placeholder=Message...]",
						),
						m("input", {
							type: "submit",
							id: "chat-submit",
							name: "chat-submit",
							value: "→",
							hidden: true,
						}),
					]),
				]),
			])
			: undefined
	}
	onKeydownListener(event) {
		const tag = event.target?.tagName ?? ""
		// pressing Enter will focus the chat, when no input is being focused
		if (event.code === "Enter" && tag !== "INPUT") {
			event.preventDefault()
			// @ts-ignore
			document.querySelector("div.ui-chat input#chat-input")?.focus()
		}
		// pressing Escape will unset the focus from chat
		else if (event.code === "Escape" && event.target?.id === "chat-input") {
			// @ts-ignore
			document.querySelector("div.ui-chat input#chat-input")?.blur()
		}
	}
	onSubmit(event) {
		event.preventDefault()
		if (State.socket == null) return
		// @ts-ignore
		const message = document.querySelector("div.ui-chat input#chat-input").value || ""
		// empty submit will unset the focus
		if (message === "") {
			event.stopPropagation()
			// @ts-ignore
			document.activeElement?.blur()
			return false
		}
		event.target.reset()
		/** @type {import("../../src/Packets.js").TChatPacket} */
		const pkt = {
			type: "chat",
			from: State.player?.name ?? "unknown",
			to: "world",
			message,
		}
		State.socket.send(JSON.stringify(pkt));
		// example echo
		//document.dispatchEvent(new CustomEvent("ui-chat", { detail: pkt }))
	}
	// bind chat event listener to document element
	// to receive chat messages from any where in the app
	onDOMChat(event) {
		State.chat.push(event.detail)
	}


	/**
	 * Dispatches a custom event named "ui-chat" with the given data.
	 * The event is used to update the chat state on the UI.
	 * @param {import("../../src/Packets.js").TChatPacket} data - The chat message data.
	 * @example
	 * ChatUI.addChat({
	 * 	type: "chat",
	 * 	from: "player",
	 * 	to: "world",
	 * 	message: "Hello World",
	 * });
	 */
	static addChat(data) {
		// document.dispatchEvent(new CustomEvent("ui-chat", { detail: data }));
		State.chat.push(data)
		m.redraw()
	}
}