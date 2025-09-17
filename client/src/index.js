import "./style.css"
import { tags } from "./UI/index.js"
import { Auth } from "./Auth.js"
import { State } from "./State.js"
import SocketControl from "./control/SocketControl.js"
import LoginUI from "./UI/Login.js"
import CharacterUI from "./UI/Character.js"
import ChatUI from "./UI/Chat.js"
import CanvasUI from "./UI/Canvas.js"
import DialogNPC from "./UI/DialogNPC.js"
import DialogUI from "./UI/Dialog.js"
import ExitGameUI from "./UI/ExitGame.js"
import SkillBarUI from "./UI/SkillBar.js"
import SkillTreeUI from "./UI/SkillTree.js"

const { fragment, div, h1, p, button } = tags
const root = document.body

// show dialog to reconnect
const connectionClosedDialog = () => DialogUI({
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

// Render the appropriate UI based on the authentication state
Auth.isLoggedIn.subscribe((isLoggedIn) => {
	if (isLoggedIn) {
		// disable select event
		root.addEventListener("selectstart", onDisableSelectStart)
		// render the game UI
		root.replaceChildren(fragment(
			CanvasUI(), // where the game is rendered
			ChatUI(),
			CharacterUI(),
			SkillBarUI(),
			SkillTreeUI(),
			DialogNPC(),
			// Note: keep these at the end
			ExitGameUI(),
			connectionClosedDialog(),
		))

		// close any previous socket
		if (State.socket) State.socket.remove()
		// initialize the web socket
		State.socket = new SocketControl()
	} else {
		root.replaceChildren(LoginUI())
		// enable select event
		root.removeEventListener("selectstart", onDisableSelectStart)
	}
})

// Initial render
document.body.appendChild(LoginUI())

// Window resize event handler
// remove top left position attributes from styled elements
let resizeTimeout;
function onResize() {
	if (resizeTimeout) return
	resizeTimeout = setTimeout(() => resizeTimeout = null, 100)
	document.querySelectorAll(".ui").forEach((/** @type {HTMLElement} */ui) => {
		ui.style.top = ui.style.left = ""
	})
}
window.addEventListener("resize", onResize)

/**
 * Disable text selection in the game UI.
 *
 * @param {Event} event - The selectstart event.
 */
function onDisableSelectStart(event) {
	event.preventDefault()
}
