import m from "mithril"
import "./ChatUI.css"
import { State } from "../State.js"
import { sendChat } from "../events/sendChat.js"

export default class ChatUI {
	/**
	 * @param {m.Vnode} vnode
	 */
	constructor(vnode) {
		this.isVisible = true
		/** @type {string} - channel name e.g. "default" | "private" | "log" */
		this.activeTab = "default"

		this.messages = []
		this.messagesMax = 10
		this.messagesAt = 0

		this._onTabsClick = this.onTabsClick.bind(this)
		this._onSubmit = this.onSubmit.bind(this)
		this._onFocusIn = this.onFocusIn.bind(this)
		this._onFocusOut = this.onFocusOut.bind(this)
		this._onKeydownListener = this.onKeydownListener.bind(this)
		this._onSelectStart = this.onSelectStart.bind(this)
		// custom event to update chat state on the UI
		this._onDOMChat = this.onDOMChat.bind(this)
	}

	/** @param {m.VnodeDOM} vnode */
	oncreate(vnode) {
		vnode.dom.addEventListener("selectstart", this._onSelectStart)
		window.addEventListener("keydown", this._onKeydownListener)
		document.addEventListener("ui-chat", this._onDOMChat)
		vnode.dom.addEventListener("focusin", this._onFocusIn)
		vnode.dom.addEventListener("focusout", this._onFocusOut)
	}

	/** @param {m.VnodeDOM} vnode */
	onremove(vnode) {
		vnode.dom.removeEventListener("selectstart", this._onSelectStart)
		window.removeEventListener("keydown", this._onKeydownListener)
		document.removeEventListener("ui-chat", this._onDOMChat)
		vnode.dom.removeEventListener("focusin", this._onFocusIn)
		vnode.dom.removeEventListener("focusout", this._onFocusOut)
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
		event.preventDefault()
		event.stopPropagation()

		/** @type {HTMLElement|null} */
		const target = event.target
		if (!target) return

		const targetTablink = target.closest("div.tablink")
		if (!targetTablink) return

		const activeTab = targetTablink.getAttribute("data-active-tab")
		if (!activeTab) return

		// @ts-ignore
		this.activeTab = activeTab
		// @ts-ignore
		document.querySelector("div.ui-chat input#chat-input")?.focus()

		//m.redraw()
	}

	onKeydownListener(event) {
		// pressing Enter will focus the chat, when no input is being focused
		if (event.code === "Enter" && event.target?.tagName !== "INPUT") {
			event.preventDefault()
			// @ts-ignore
			document.querySelector("div.ui-chat input#chat-input")?.focus()
		}
		else if (event.target?.id === "chat-input") {
			// pressing Escape will unset the focus from chat
			if (event.code === "Escape") {
				// @ts-ignore
				event.target?.blur()
			}
			else if (event.code === "ArrowUp") {
				this.messagesAt = this.messagesAt - 1;
				// get old message and add it to the chat input element
				const oldMessage = this.messages[this.messagesAt]
				if (oldMessage) {
					// @ts-ignore
					event.target.value = oldMessage
				} else {
					event.target.value = ""
				}
				if (this.messagesAt < 0) {
					this.messagesAt = 0
				}
			}
			else if (event.code === "ArrowDown") {
				this.messagesAt = this.messagesAt + 1;
				// get old message and add it to the chat input element
				const oldMessage = this.messages[this.messagesAt]
				if (oldMessage) {
					// @ts-ignore
					event.target.value = oldMessage
				} else {
					event.target.value = ""
				}
				if (this.messagesAt > this.messages.length) {
					this.messagesAt = this.messages.length
				}
			}
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

		// socket and player state exists
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
			// reset last message index
			this.messagesAt = this.messages.length
			return false
		}

		// reset form
		form.reset()

		// send chat message
		State.socket.send(sendChat(
			this.activeTab || "default",
			State.player.name || "unknown",
			"any", // TODO private chat, player name goes here
			message
		));

		// add message to the memory
		this.messages.push(message)
		// remove old messages
		if (this.messages.length > this.messagesMax) {
			this.messages.shift()
		}
		this.messagesAt = this.messages.length;
	}

	/**
	 * Handles the focus-in event for the chat UI.
	 * This method adds the "ontop" class to the chat UI element,
	 * ensuring that it appears on top layers when focused.
	 *
	 * @param {FocusEvent} event - The focus event.
	 */
	onFocusIn(event) {
		try {
			// @ts-ignore
			document.querySelector("div.ui-chat").classList.add("ontop")
		} catch (e) {
			// silent
		}
	}

	/**
	 * Handles the focus-out event for the chat UI.
	 * This method removes the "ontop" class from the chat UI element,
	 * ensuring that it is no longer visible on top layers when unfocused.
	 *
	 * @param {FocusEvent} event - The focus event.
	 */
	onFocusOut(event) {
		try {
			// @ts-ignore
			document.querySelector("div.ui-chat").classList.remove("ontop")
		} catch (e) {
			// silent
		}
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
		/** @type {import("../events/sendChat.js").TChatPacket} */
		const data = event.detail

		State.chat.push({
			timestamp: Date.now(),
			...data,
		})

		m.redraw()
	}

	/**
	 * Adds a chat message to the chat UI.
	 *
	 * @param {import("../events/sendChat.js").TChatPacket} params - The chat message data.
	 *
	 * @example ChatUI.emit({
	 * 	type: "chat",
	 *  channel: "default",
	 * 	from: "player",
	 * 	to: "world",
	 * 	message: "Hello World",
	 * });
	 */
	static emit(params) {
		return document.dispatchEvent(new CustomEvent("ui-chat", { detail: params }));
	}
}
