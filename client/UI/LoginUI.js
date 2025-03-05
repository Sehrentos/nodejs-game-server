import m from "mithril"
import "./LoginUI.css"
import { Auth } from "../Auth.js"
/**
 * @typedef {Object} TLoginUI
 * @prop {boolean} isRegister whether user is logged in
 * @prop {string} nextView next view to redirect to after login or registration
 */

/**
 * @class LoginUI
 * @type {TLoginUI}
 */
export default class LoginUI {
	constructor(vnode) {
		this.isRegister = false
		this.isRemember = false
		this.isLoading = false
		this.errorMessage = ""
		this.nextView = vnode.attrs.nextView || "#!/game"
		this._onSubmit = this.onSubmit.bind(this)
		this._onChange = this.onChange.bind(this)

		// Note: we instead store jwtToken in localstorage, instead plain username & password
		// get local storage credentials if exists
		// this.credentials = this.getCredentials()
		// if (this.credentials.username && this.credentials.password) {
		// 	this.isRemember = true

		// auto login check if JWT token exists
		try {
			const jwtToken = localStorage.getItem("token") || ""
			if (jwtToken) {
				this.isRemember = true
				this.isLoading = true
				this.errorMessage = ""
				Auth.loginToken(jwtToken, this.isRemember).then(() => {
					// success, move to next view
					this.isLoading = false
					window.location.href = this.nextView
				}).catch(e => {
					console.log("login failed:", e.message)
					this.isLoading = false
					this.errorMessage = e.message
					localStorage.removeItem("token")
					m.redraw()
				})
			}
		} catch (e) {
			console.log("login (token) failed", e.message)
		}
	}
	view() {
		return m("main.ui-login", [
			m("form#login-form[autocomplete=off]", {
				onsubmit: this._onSubmit,
			}, [
				m("div.title", this.isRegister ? "Register" : "Login"),
				m("p", "Note: This is only for testing purposes."),
				m("p", "Register an account to play the game."),
				m("div.response", this.isLoading ? "Loading..." : this.errorMessage),
				m("input", {
					type: "text",
					name: "username",
					id: "username",
					placeholder: "Username",
					// value: this.credentials.username,
					required: true,
					autofocus: true,
				}),
				m("input", {
					type: "password",
					name: "password",
					id: "password",
					placeholder: "Password",
					// value: this.credentials.password,
					required: true,
				}),
				m("input", {
					type: "email",
					name: "email",
					id: "email",
					placeholder: "Email",
					className: this.isRegister ? "" : "ui-hidden",
					required: this.isRegister,
				}),
				m("input", {
					type: "submit",
					value: "Submit",
					disabled: this.isLoading
				}),
				m("label[for=register]", m("input", {
					type: "checkbox",
					id: "register",
					name: "register",
					onchange: this._onChange,
				}),
					"Register"),
				m("label[for=remember]", m("input", {
					type: "checkbox",
					id: "remember",
					name: "remember",
					onchange: this._onChange,
					checked: this.isRemember
				}),
					"Remember"),
			]),
		])
	}

	/**
	 * @param {SubmitEvent} event 
	 */
	async onSubmit(event) {
		event.preventDefault()

		// reset error message
		this.errorMessage = ""

		// check is loading already
		if (this.isLoading) return

		/** @type {HTMLFormElement} */
		// @ts-ignore
		const form = event.currentTarget
		// @ts-ignore null checked
		const username = form.querySelector("input#username")?.value ?? ""
		// @ts-ignore null checked
		const password = form.querySelector("input#password")?.value ?? ""
		// @ts-ignore null checked
		const email = form.querySelector("input#email")?.value ?? ""

		form.reset()

		// save credentials to local storage
		// if (this.isRemember) {
		// 	this.saveCredentials(username, password)
		// } else {
		// 	this.removeCredentials()
		// }

		// register or login
		if (this.isRegister) {
			try {
				await Auth.register(username, password, email, this.isRemember)
			} catch (e) {
				console.log("register failed", e.message)
				this.errorMessage = e.message
			}
		} else {
			try {
				await Auth.login(username, password, this.isRemember)
			} catch (e) {
				console.log("login failed", e.message)
				this.errorMessage = e.message
			}
		}
		// success, move to next view
		window.location.href = this.nextView
	}

	/**
	 * @param {Event} event 
	 */
	onChange(event) {
		// @ts-ignore tested, id exists
		switch (event.target.id) {
			case "register":
				// @ts-ignore tested, checked exists
				this.isRegister = event.target.checked
				this.errorMessage = "" // reset error message
				m.redraw()
				break;
			case "remember":
				// @ts-ignore tested, checked exists
				this.isRemember = event.target.checked
				break;
			default:
				break;
		}
	}

	// username & password in local storage
	// /**
	//  * Save the username and password to local storage.
	//  * @param {string} username 
	//  * @param {string} password 
	//  */
	// saveCredentials(username, password) {
	// 	localStorage.setItem("username", username)
	// 	localStorage.setItem("password", password)
	// }

	// /**
	//  * Removes the saved username and password from local storage.
	//  */
	// removeCredentials() {
	// 	localStorage.removeItem("username")
	// 	localStorage.removeItem("password")
	// }

	// /**
	//  * Get the saved username and password from local storage.
	//  * @returns {{username: string, password: string}} - The saved credentials.
	//  */
	// getCredentials() {
	// 	return {
	// 		username: localStorage.getItem("username") || "",
	// 		password: localStorage.getItem("password") || "",
	// 	}
	// }
}