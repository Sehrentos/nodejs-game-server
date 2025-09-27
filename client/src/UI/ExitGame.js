import "./ExitGame.css"
import { tags } from "../utils/seui.js"
import { sendLogout } from "../events/sendLogout.js"
import Events from "../Events.js"

const { div, button, header } = tags

/**
 * An `ui-exit-game` component that shows options to exit the game or logout.
 *
 * Events:
 * - ui-exit-game-toggle
 *
 * @param {import("../State.js").State} state
 *
 * @returns {HTMLElement}
 */
export default function ExitGameUI(state) {
	// create the exit game UI
	const ui = div({ class: "ui card centered ui-exit-game ontop" },
		header("Exit Game"),
		div({ class: "flex-column" },
			button({ onclick: onExit }, "Exit"),
			button({ onclick: onLogout }, "Exit and logout"),
			button({ onclick: close }, "Cancel"),
		),
	)

	function onExit() {
		state.socket?.remove();
		window.location.href = "/";
	}

	function onLogout() {
		// send logout packet that will remove the JWT token in server
		state.socket?.send(sendLogout());
		// TODO await response from server before leave or trust it to handle the logout process?
		state.socket?.remove();
		// clear token
		localStorage.removeItem("token");
		window.location.href = "/";
	}

	function close() {
		ui.classList.remove("open");
	}

	function toggle() {
		ui.classList.toggle("open");
	}

	// add global event listeners
	Events.on("ui-exit-game-toggle", toggle);

	return ui
}


