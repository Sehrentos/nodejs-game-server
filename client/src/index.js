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

console.log(`App started in ${process.env.NODE_ENV} mode.`)

// Get the root element, where to render the UI
const root = document.body

// set state variables
state.root = root
state.auth = auth

// create the canvas and add it to the root
state.canvas = CanvasUI("game-canvas")
root.appendChild(state.canvas)

// initialize the renderer
state.renderer = new Renderer(state)

// register all UI components
state.ui.set("login", LoginUI(state))
state.ui.set("character", CharacterUI(state))
state.ui.set("chat", ChatUI(state))
state.ui.set("skillbar", SkillBarUI(state))
state.ui.set("skilltree", SkillTreeUI(state))
state.ui.set("inventory", Inventory(state))
state.ui.set("dialognpc", DialogNPC(state))
state.ui.set("exitgame", ExitGameUI(state))
state.ui.set("dialogconnectionclosed", DialogConnectionClosed(state))

// render all UI components
state.ui.forEach(ui => root.appendChild(ui))

// register global event listeners / observers
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
	state.socket = new SocketControl(state)
	state.keyControl = new KeyControl(state)
	state.touchControl = new TouchControl(state)
	state.playerControl = new PlayerControl(state)
})
