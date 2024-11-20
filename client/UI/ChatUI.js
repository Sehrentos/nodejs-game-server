import m from "mithril"
import "./ChatUI.css"
import { State } from "../State.js"

export default class ChatUI {
	/**
	 * @param {m.Vnode} vnode 
	 */
	constructor(vnode) {
		this.isVisible = true
		/** @type {string} - channel name e.g. "default" | "private" | "log" */
		this.activeTab = "default"
		// this.messages = State.chat // []

		this._onTabsClick = this.onTabsClick.bind(this)
		this._onSubmit = this.onSubmit.bind(this)
		this._onKeydownListener = this.onKeydownListener.bind(this)
		this._onSelectStart = this.onSelectStart.bind(this)
		// custom event to update chat state on the UI
		this._onDOMChat = this.onDOMChat.bind(this)
	}

	oncreate(vnode) {
		vnode.dom.addEventListener("selectstart", this._onSelectStart)
		window.addEventListener("keydown", this._onKeydownListener)
		document.addEventListener("ui-chat", this._onDOMChat)
	}

	onremove(vnode) {
		vnode.dom.removeEventListener("selectstart", this._onSelectStart)
		window.removeEventListener("keydown", this._onKeydownListener)
		document.removeEventListener("ui-chat", this._onDOMChat)
	}

	onupdate(vnode) {
		const _ul = document.querySelector(`div.ui-chat ul[data-active-tab="${this.activeTab}"]`)
		_ul.scrollTop = _ul.scrollHeight // update scroll position
	}

	view(vnode) {
		return this.isVisible
			? m("div.ui-chat",
				m("form#chat-form[autocomplete=off]", { onsubmit: this._onSubmit },
					/** create tabs */
					m("div.tab", { onclick: this._onTabsClick },
						m("div", {
							"data-active-tab": "default",
							class: this.activeTab === "default" ? "tablink active" : "tablink",
						}, "Default"),
						m("div", {
							"data-active-tab": "log",
							class: this.activeTab === "log" ? "tablink active" : "tablink",
						}, "Logs"),
					),
					/** create tabcontent */
					m("ul#chat-tabcontent", {
						"data-active-tab": "default",
						class: this.activeTab === "default" ? "tabcontent active" : "tabcontent",
					},
						State.chat.filter(p => p.channel === "default")
							.map((msg, key) => m("li", { key }, `${msg.from}: ${msg.message}`))
					),
					m("ul#logs-tabcontent", {
						"data-active-tab": "log",
						class: this.activeTab === "log" ? "tabcontent active" : "tabcontent",
					},
						State.chat.filter(p => p.channel === "log")
							.map((msg, key) => m("li", { key }, `${msg.from}: ${msg.message}`))
					),
					/** create form inputs */
					m("div.inputs",
						m("input", {
							id: "chat-input",
							name: "chat-input",
							type: "text",
							placeholder: "Chat message...",
						}),
						m("input", {
							id: "chat-submit",
							name: "chat-submit",
							type: "submit",
							hidden: true,
						}),
					),
				)
			)
			: undefined
	}

	onTabsClick(event) {
		/** @type {HTMLElement|null} */
		const target = event.target
		if (!target) return

		const targetTablink = target.closest("div.tablink")
		if (!targetTablink) return

		const activeTab = targetTablink.getAttribute("data-active-tab")
		if (!activeTab) return

		event.preventDefault()
		event.stopPropagation()

		// @ts-ignore
		this.activeTab = activeTab

		m.redraw()
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

	/**
	 * Handles the chat form submission event.
	 * Prevents the default form submission behavior, checks if the WebSocket connection
	 * is ready, retrieves the chat message from the input, and sends it to the server.
	 * If the message input is empty, it blurs the input and stops event propagation.
	 * Resets the form after sending the message.
	 *
	 * @param {SubmitEvent} event - The form submission event.
	 */
	onSubmit(event) {
		event.preventDefault()

		// socket is ready and player state exists
		if (State.socket == null || State.player == null) return

		/** @type {HTMLFormElement|null} - chat form element **/
		// @ts-ignore
		const form = event.currentTarget
		if (!form) return

		/** @type {HTMLInputElement|null} - chat input element **/
		const input = form.querySelector("input#chat-input")
		if (!input) return

		// get message from the input
		const message = input.value || ""

		// is empty, unset the focus
		if (message === "") {
			event.stopPropagation()
			// @ts-ignore
			document.activeElement?.blur()
			return false
		}

		// reset form
		form.reset()

		// send chat message
		/** @type {import("../../src/Packets.js").TChatPacket} */
		const pkt = {
			type: "chat",
			channel: this.activeTab || "default",
			from: State.player.name || "unknown",
			to: "any", // TODO private chat, player name goes here
			message,
		}
		State.socket.send(JSON.stringify(pkt));
	}

	/**
	 * @param {Event} event - The selectstart event.
	 */
	onSelectStart(event) {
		// below will prevent text selection and
		// is set in the GameUI oncreate method:
		// event.preventDefault()
		// But, we need to stop event propagation,
		// so in the ChatUI we can still select text
		event.stopPropagation()
	}

	// bind chat event listener to document element
	// to receive chat messages from any where in the app
	onDOMChat(event) {
		State.chat.push(event.detail)
		m.redraw()
	}

	/**
	 * Adds a chat message to the chat UI.
	 * 
	 * @param {import("../../src/Packets.js").TChatPacket} data - The chat message data.
	 * @example
	 * ChatUI.add({
	 * 	type: "chat",
	 *  channel: "default",
	 * 	from: "player",
	 * 	to: "world",
	 * 	message: "Hello World",
	 * });
	 */
	static add(data) {
		// document.dispatchEvent(new CustomEvent("ui-chat", { detail: data }));
		State.chat.push({
			timestamp: Date.now(),
			...data,
		})
		m.redraw()
	}
}