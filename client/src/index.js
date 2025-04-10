import m from "mithril"
import "./style.css"
import LoginUI from "./UI/LoginUI.js"
import GameUI from "./UI/GameUI.js"
import { Auth } from "./Auth.js"

// start application, by routing
m.route(document.body, "/login", {
	"/game": {
		onmatch: (args) => {
			if (Auth.isLoggedIn) {
				return GameUI
			}
			return m.route.SKIP
		}
	},
	"/login": LoginUI,
	//"/:404...": PageNotFound,
})

// function PageNotFound() {
//     return {
//         view: () => m("h1", "Page not found")
//     }
// }