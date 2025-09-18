import { tags } from "./index.js"
import { State } from "../State.js"
import DialogUI from "./Dialog.js"

const { h1, p, button } = tags

/**
 * An dialog to reconnect when the WebSocket connection is closed
 * @returns {HTMLElement}
 */
export default function DialogConnectionClosed() {
	return DialogUI({
		id: "socket-connection",
		isVisible: State.socket != null && State.socket.readyState === WebSocket.CLOSED,
		isBackdropVisible: true,
		isBackdropClose: false
	},
		h1("Connection closed"),
		p("The web socket connection has been closed."),
		p("Click the button below to log in again."),
		button({
			type: "button",
			//class: "btn btn-primary",
			onclick: () => {
				// it's probably better to reload the page
				// clean up the state etc.
				window.location.reload()
				// navigate to login UI
				// window.location.href = "/#!/login"
			}
		}, "Go to login")
	)
}
