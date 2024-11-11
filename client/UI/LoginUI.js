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
		this.nextView = vnode.attrs.nextView || "#!/game"
		this._onSubmit = this.onSubmit.bind(this)
		this._onChange = this.onChange.bind(this)
	}
	view() {
		return m("main.ui-login", [
			m("form#login-form[autocomplete=off]", {
				onsubmit: this._onSubmit,
			}, [
				m("div.title", this.isRegister ? "Register" : "Login"),
				m("p", "Note: This is only for testing purposes."),
				m("p", "Any login credentials will be accepted for this demo."),
				m("input", {
					type: "text",
					name: "username",
					id: "username",
					placeholder: "Username",
					required: true,
				}),
				m("input", {
					type: "password",
					name: "password",
					id: "password",
					placeholder: "Password",
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
				}),
				m("label[for=register]", m("input", {
					type: "checkbox",
					id: "register",
					name: "register",
					onchange: this._onChange,
				}),
					"Register"),
			]),
		])
	}

	/**
	 * @param {SubmitEvent} event 
	 */
	async onSubmit(event) {
		event.preventDefault()
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
		if (this.isRegister) {
			try {
				await Auth.register(username, password, email)
			} catch (e) {
				console.log("register failed", e.message)
			}
		} else {
			try {
				await Auth.login(username, password)
			} catch (e) {
				console.log("login failed", e.message)
			}
		}
		// success, move to next view
		window.location.href = this.nextView
	}

	/**
	 * @param {Event} event 
	 */
	onChange(event) {
		// @ts-ignore
		this.isRegister = event.target.checked
		console.log(event.type, this.isRegister)
		m.redraw()
	}

}