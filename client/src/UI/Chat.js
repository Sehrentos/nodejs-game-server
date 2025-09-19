import "./Chat.css"
import { tags } from "./index.js"
import { State } from "../State.js"
import { sendChat } from "../events/sendChat.js"
import Observable from "../utils/Observable.js"

const { form, div, ul, li, input } = tags

/** channel name e.g. "default" | "private" | "log" */
const activeTab = new Observable("default")
const messagesMax = 10

let messages = []
let messagesAt = 0

/**
 * create .tablink element
 * @param {string} channelName
 * @param {string} channelValue
 */
const createTab = (channelName, channelValue) => div({
	"data-active-tab": channelName,
	class: activeTab.value === channelName ? "tablink active" : "tablink",
}, channelValue)

/**
 * create .tabcontent element
 * @param {string} channel
 */
const createChannel = (channel = "default") => ul(
	{
		id: `${channel}-tabcontent`,
		"data-active-tab": channel,
		class: activeTab.value === channel ? "tabcontent active" : "tabcontent",
	},
	createChannelItem(channel)
)

/**
 * create chat list item for the given channel
 * @param {string} channel
 * @returns
 */
const createChannelItem = (channel = "default") => State.chat.value
	.filter(p => p.channel === channel)
	.map((p) => li(`${p.from}: ${p.message}`))

// create default tab and channel
const defaultTab = createTab("default", "Default")
const defaultChannel = createChannel("default")

// create log tab and channel
const logTab = createTab("log", "Logs")
const logChannel = createChannel("log")

// subscribe to chat changes for updates
State.chat.subscribe((current) => {
	console.log("[DEBUG] ChatUI: chat state updated", current)
	defaultChannel.replaceChildren(...createChannelItem("default"))
	logChannel.replaceChildren(...createChannelItem("log"))
	setScroll()
})

// subscribe to activeTab changes for updates
activeTab.subscribe((active) => {
	switch (active) {
		case "default":
			defaultTab.classList.add("active")
			defaultChannel.classList.add("active")
			logTab.classList.remove("active")
			logChannel.classList.remove("active")
			break;
		case "log":
			defaultTab.classList.remove("active")
			defaultChannel.classList.remove("active")
			logTab.classList.add("active")
			logChannel.classList.add("active")
			break;
		default:
			return;
	}
	setScroll()
})

/**
 * Renders the chat UI component.
 */
export default function render() {
	const ui = div({ class: "ui ui-chat open" },
		form({ id: "chat-form", autocomplete: "off", onsubmit },
			/** create tabs */
			div({ class: "tab", onclick: onClickTabs },
				defaultTab,
				logTab,
			),
			/** create tabcontent */
			defaultChannel,
			logChannel,
			/** create form inputs */
			div({ class: "inputs" },
				input({
					id: "chat-input",
					name: "chat-input",
					type: "text",
					placeholder: "Chat message...",
				}),
				input({
					id: "chat-submit",
					name: "chat-submit",
					type: "submit",
					hidden: true,
				}),
			)
		)
	)
	// oncreate events
	window.addEventListener("keydown", onKeydownListener)
	ui.addEventListener("selectstart", onSelectStart)
	ui.addEventListener("focusin", onFocusIn)
	ui.addEventListener("focusout", onFocusOut)
	// State.events.on("ui-chat", onDOMChat)
	return ui
}

// function onremove(vnode) {
// 	vnode.dom.removeEventListener("selectstart", onSelectStart)
// 	window.removeEventListener("keydown", onKeydownListener)
// 	State.events.off("ui-chat", onDOMChat)
// 	vnode.dom.removeEventListener("focusin", onFocusIn)
// 	vnode.dom.removeEventListener("focusout", onFocusOut)
// }

/**
 * Updates the chat UI by scrolling to the bottom of the active chat tab.
 * This ensures that the latest messages are visible to the user.
 */
function setScroll() {
	try {
		const activeList = document.querySelector(`div.ui-chat ul[data-active-tab="${activeTab.value}"]`)
		if (activeList == null) return
		activeList.scrollTop = activeList.scrollHeight // update scroll position
	} catch (e) {
		// silent
	}
}

function onClickTabs(event) {
	event.preventDefault()
	event.stopPropagation()

	/** @type {HTMLElement|null} */
	const target = event.target
	if (!target) return

	const targetTablink = target.closest("div.tablink")
	if (!targetTablink) return

	const _activeTab = targetTablink.getAttribute("data-active-tab")
	if (!_activeTab) return

	// update active tab
	activeTab.set(_activeTab)
	// @ts-ignore
	document.querySelector("div.ui-chat input#chat-input")?.focus()
}

function onKeydownListener(event) {
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
			messagesAt = messagesAt - 1;
			// get old message and add it to the chat input element
			const oldMessage = messages[messagesAt]
			if (oldMessage) {
				// @ts-ignore
				event.target.value = oldMessage
			} else {
				event.target.value = ""
			}
			if (messagesAt < 0) {
				messagesAt = 0
			}
		}
		else if (event.code === "ArrowDown") {
			messagesAt = messagesAt + 1;
			// get old message and add it to the chat input element
			const oldMessage = messages[messagesAt]
			if (oldMessage) {
				// @ts-ignore
				event.target.value = oldMessage
			} else {
				event.target.value = ""
			}
			if (messagesAt > messages.length) {
				messagesAt = messages.length
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
function onsubmit(event) {
	event.preventDefault()

	// socket and player state exists
	if (State.socket == null || State.player.value == null) return

	/** @type {HTMLFormElement|null} - chat form element **/
	// @ts-ignore
	const formElement = event.currentTarget
	if (!formElement) return

	/** @type {HTMLInputElement|null} - chat input element **/
	const inputElement = formElement.querySelector("input#chat-input")
	if (!inputElement) return

	// get message from the input
	const message = inputElement.value || ""

	// is empty, unset the focus
	if (message === "") {
		event.stopPropagation()
		// @ts-ignore
		document.activeElement?.blur()
		// reset last message index
		messagesAt = messages.length
		return false
	}

	// reset form
	formElement.reset()

	// send chat message
	State.socket.send(sendChat(
		activeTab.value || "default",
		State.player.value.name || "unknown",
		"any", // TODO private chat, player name goes here
		message
	));

	// add message to the memory
	messages.push(message)
	// remove old messages
	if (messages.length > messagesMax) {
		messages.shift()
	}
	messagesAt = messages.length;
}

/**
 * Handles the focus-in event for the chat UI.
 * This method adds the "ontop" class to the chat UI element,
 * ensuring that it appears on top layers when focused.
 *
 * @param {FocusEvent} event - The focus event.
 */
function onFocusIn(event) {
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
function onFocusOut(event) {
	try {
		// @ts-ignore
		document.querySelector("div.ui-chat").classList.remove("ontop")
	} catch (e) {
		// silent
	}
}

/**
 * Handles the selectstart event for the chat UI.
 * This method stops the propagation of the selectstart event,
 * allowing text selection within the chat UI without affecting other UI elements.
 *
 * In the game UI, text selection is generally disabled to prevent interference
 * with game controls, but this method ensures that text can still be selected
 * within the chat UI.
 *
 * @param {Event} event - The selectstart event.
 */
function onSelectStart(event) {
	event.stopPropagation()
}

// /**
//  * handle the custom "ui-chat" event to update the chat UI.
//  * @param {import("../events/sendChat.js").TChatPacket} data
//  */
// function onDOMChat(data) {
// 	State.chat.set((current) => ([
// 		...current,
// 		{ timestamp: Date.now(), ...data },
// 	]))
// }
