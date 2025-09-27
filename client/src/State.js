import Observable from "./utils/Observable.js";

/**
 * Game state constainer
 */
export class State {
	constructor() {
		/**
		 * Page root element that contains all game UI
		 * @type {null|HTMLElement}
		 */
		this.root = null

		// /** @type {import("./locale/locale.js").TLocale|null} */
		// this.locale= null

		/**
		 * Game canvas element
		 * @type {null|HTMLCanvasElement}
		 */
		this.canvas = null

		/**
		 * Game UI elements / components
		 * @type {Map<string, HTMLElement>}
		 */
		this.ui = new Map()

		/**
		 * The renderer for the game
		 * @type {import("./Renderer.js").default|null}
		 */
		this.renderer = null

		/**
		 * The key control for the game
		 * @type {import("./control/KeyControl.js").default|null}
		 */
		this.keyControl = null

		/**
		 * The touch control for the game
		 * @type {import("./control/TouchControl.js").default|null}
		 */
		this.touchControl = null

		/**
		 * Authentication state
		 * @type {import("./Auth.js").Auth|null}
		 */
		this.auth = null

		/**
		 * WebSocket controller
		 * @type {import("./control/SocketControl.js").default|null}
		 */
		this.socket = null

		/**
		 * Player state
		 * @type {Observable<null|import("../../shared/models/Entity.js").Entity>}
		 */
		this.player = new Observable(null)

		/**
		 * Player controller
		 * @type {import("./control/PlayerControl.js").default|null}
		 */
		this.playerControl = null

		/**
		 * World map state
		 * @type {Observable<null|import("../../shared/models/WorldMap.js").WorldMap>}
		 */
		this.map = new Observable(null)

		/**
		 * Chat state
		 * @type {Observable<import("../../server/src/events/sendChat.js").TChatPacket[]>}
		 */
		this.chat = new Observable([{
			type: "chat",
			channel: "default",
			from: "info",
			to: "world",
			message: `Move with WASD or Arrow keys. Press "C" to toggle character info. Type "/help" for commands. Press "Escape" to open exit menu.`,
			timestamp: Date.now()
		}])
	}
}

/**
 * Singleton instance of the game state
 */
const state = new State();
export default state
