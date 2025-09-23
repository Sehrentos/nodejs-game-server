import "./style.css"
import auth from "./Auth.js"
import state from "./State.js"
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
import Inventory from "./UI/Inventory.js"
import Renderer from "./Renderer.js"
import KeyControl from "./control/KeyControl.js"
import TouchControl from "./control/TouchControl.js"
import PlayerControl from "./control/PlayerControl.js"

// Get the root element, where to render the UI
const root = document.body

// where the game is rendered
state.canvas = CanvasUI("game-canvas")
state.renderer = new Renderer(state)

// Subscribe to changes in the authentication state
// and render the UI accordingly
// auth.isLoggedIn.subscribe((isLoggedIn) => {
// 	if (!isLoggedIn) {
// 		// show login UI
// 		root.replaceChildren(LoginUI())
// 		root.removeEventListener("selectstart", onPreventDefault)
// 		root.removeEventListener("contextmenu", onPreventDefault)
// 		return
// 	}
// 	// show game UI
// 	root.replaceChildren(
// 		CanvasUI(), // where the game is rendered
// 		CharacterUI(),
// 		ChatUI(),
// 		SkillBarUI(),
// 		SkillTreeUI(),
// 		Inventory(),
// 		DialogNPC(),
// 		// Note: keep these at the end to ensure they are rendered on top
// 		ExitGameUI(),
// 		DialogConnectionClosed(),
// 	)
// 	// disable selectstart event to disable text selection in the game UI
// 	root.addEventListener("selectstart", onPreventDefault)
// 	// disable context menu to disable right click menu in the game UI
// 	root.addEventListener("contextmenu", onPreventDefault)
// })

// Initial render, possibly showing loader/landing page
// root.appendChild(LoginUI())

// show game UI
root.append(
	state.canvas,
	LoginUI(),
	CharacterUI(),
	ChatUI(),
	SkillBarUI(),
	SkillTreeUI(),
	Inventory(),
	DialogNPC(),
	// Note: keep these at the end to ensure they are rendered on top
	ExitGameUI(),
	DialogConnectionClosed(),
)
// disable selectstart event to disable text selection in the game UI
root.addEventListener("selectstart", onPreventDefault)
// disable context menu to disable right click menu in the game UI
root.addEventListener("contextmenu", onPreventDefault)

// add document event listeners for [data-draggable="true"] support
addDraggableEventListeners({ resetOnResize: true })

// Subscribe to changes in the JWT token
// and initialize the web socket
// without a token, the web socket cant be initialized
auth.jwtToken.subscribe((token) => {
	if (!token) return
	// initialize the game
	state.socket?.remove()
	state.socket = new SocketControl(state, auth)
	state.keyControl = new KeyControl(state)
	state.touchControl = new TouchControl(state)
	state.playerControl = new PlayerControl(state)
})

console.log(`App started in ${process.env.NODE_ENV} mode.`)
