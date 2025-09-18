import "./ExitGame.css"
import { tags } from "./index.js"
import { State } from "../State.js"
import { sendLogout } from "../events/sendLogout.js"

const { div, button, header } = tags

/**
 * An `ui-exit-game` component that shows options to exit the game or logout.
 * It listens for the `ui-exit-game-toggle` event to toggle its visibility.
 */
export default function ExitGameUI() {
	// listen for event to toggle visibility
	State.events.off("ui-exit-game-toggle", toggle); // prevent duplicate listeners
	State.events.on("ui-exit-game-toggle", toggle);

	return div({ class: "ui card centered ui-exit-game ontop" },
		header("Exit Game"),
		div({ class: "flex-column" },
			button({ onclick: onExit }, "Exit"),
			button({ onclick: onLogout }, "Exit and logout"),
			button({ onclick: close }, "Cancel"),
		),
	)
}

function onExit() {
	State.socket.remove();
	window.location.href = "/";
}

function onLogout() {
	// send logout packet that will remove the JWT token in server
	State.socket.send(sendLogout());
	// TODO await response from server before leave or trust it to handle the logout process?
	State.socket.remove();
	// clear token
	localStorage.removeItem("token");
	window.location.href = "/";
}

function close() {
	document.querySelector(".ui-exit-game")?.classList?.remove("open");
}

function toggle() {
	document.querySelector(".ui-exit-game")?.classList?.toggle("open");
}
