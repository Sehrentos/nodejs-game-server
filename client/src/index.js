import "./style.css"
import { Auth } from "./Auth.js"
import { State } from "./State.js"
import SocketControl from "./control/SocketControl.js"
import onPreventDefault from "./events/onPreventDefault.js"
import { addDraggableEventListeners } from "./utils/draggable.js"
import CanvasUI from "./UI/Canvas.js"
import CharacterUI from "./UI/Character.js"
import ChatUI from "./UI/Chat.js"
import DialogConnectionClosed from "./UI/DialogConnectionClosed.js"
import DialogNPC from "./UI/DialogNPC.js"
import ExitGameUI from "./UI/ExitGame.js"
import LoginUI from "./UI/Login.js"
import SkillBarUI from "./UI/SkillBar.js"
import SkillTreeUI from "./UI/SkillTree.js"

// Get the root element, where to render the UI
const root = document.body

// Subscribe to changes in the authentication state
// and render the UI accordingly
Auth.isLoggedIn.subscribe((isLoggedIn) => {
	if (!isLoggedIn) {
		// show login UI
		root.replaceChildren(LoginUI())
		root.removeEventListener("selectstart", onPreventDefault)
		return
	}
	// show game UI
	root.replaceChildren(
		CanvasUI(), // where the game is rendered
		CharacterUI(),
		ChatUI(),
		SkillBarUI(),
		SkillTreeUI(),
		DialogNPC(),
		// Note: keep these at the end to ensure they are rendered on top
		ExitGameUI(),
		DialogConnectionClosed(),
	)
	// disable selectstart event to disable text selection in the game UI
	root.addEventListener("selectstart", onPreventDefault)
})

// Subscribe to changes in the JWT token
// and initialize the web socket
// without a token, the web socket cant be initialized
Auth.jwtToken.subscribe((token) => {
	// close any previous socket
	State.socket?.remove()
	if (token) {
		// initialize the web socket
		State.socket = new SocketControl(token)
	}
})

// Initial render, possibly showing loader/landing page
root.appendChild(LoginUI())

// add document event listeners for [data-draggable="true"] support
addDraggableEventListeners({ resetOnResize: true })

console.log(`App started in ${process.env.NODE_ENV} mode.`)
