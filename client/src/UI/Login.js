import "./Login.css"
import { tags } from "./index.js"
import { Auth } from "../Auth.js"
import Observable from "../utils/Observable.js"

const { main, form, div, p, input, label } = tags

const isRegister = new Observable(false)
const isLoading = new Observable(false)
const errorMessage = new Observable("")
const jwtToken = new Observable(localStorage.getItem("token") || "")
const isRemember = new Observable(jwtToken ? true : false)

const container = main({ class: "card ui-login" })
const render = () => container.replaceChildren(isRegister.value ? registerView() : loginView())

export default function LoginUI(props = {}) {
	// initial render
	render()
	// subscribe to changes for re-render
	// isRemember.subscribe(() => render())
	isRegister.subscribe(() => render())
	isLoading.subscribe(() => render())
	errorMessage.subscribe(() => render())
	return container
}

function loginView() {
	return form(
		{
			name: "login",
			autocomplete: "off",
			onsubmit: onSubmit,
		},
		div({ class: "header" }, "Login"),
		p("Note: This is only for testing purposes."),
		p("Login with your account to play the game."),
		div({ class: "response" }, isLoading.value ? "Loading..." : errorMessage.value),
		// hide username field when JWT token exists
		jwtToken.value ? null : input({
			type: "text",
			name: "username",
			id: "username",
			placeholder: "Username",
			// value: credentials.username,
			required: true,
			autofocus: true,
		}),
		// hide password field when JWT token exists
		jwtToken.value ? null : input({
			type: "password",
			name: "password",
			id: "password",
			placeholder: "Password",
			// value: credentials.password,
			required: true,
		}),
		input({
			id: "login",
			type: "submit",
			value: "Login",
			disabled: isLoading.value
		}),
		// show logout button when JWT token exists
		jwtToken.value ? input({
			id: "logout",
			type: "button",
			value: "Logout",
			disabled: isLoading.value,
			onclick: onLogout
		}) : null,
		label({ "for": "register" }, input({
			type: "checkbox",
			id: "register",
			name: "register",
			checked: isRegister.value,
			onchange: onChange,
		}), "Register"),
		label({ "for": "remember" }, input({
			type: "checkbox",
			id: "remember",
			name: "remember",
			onchange: onChange,
			checked: isRemember.value
		}), "Remember"),
	)
}

function registerView() {
	return form(
		{
			name: "register",
			autocomplete: "off",
			onsubmit: onSubmit,
		},
		div({ class: "header" }, "Register"),
		p("Note: This is only for testing purposes."),
		p("Register an account to play the game."),
		div({ class: "response" }, isLoading.value ? "Loading..." : errorMessage.value),
		input({
			type: "text",
			name: "username",
			id: "username",
			placeholder: "Username",
			// value: credentials.username,
			required: true,
			autofocus: true,
		}),
		input({
			type: "password",
			name: "password",
			id: "password",
			placeholder: "Password",
			// value: credentials.password,
			required: true,
		}),
		input({
			type: "email",
			name: "email",
			id: "email",
			placeholder: "Email",
			required: true,
		}),
		input({
			id: "login",
			type: "submit",
			value: "Register",
			disabled: isLoading.value
		}),
		label({ "for": "register" }, input({
			type: "checkbox",
			id: "register",
			name: "register",
			checked: isRegister.value,
			onchange: onChange,
		}), "Register"),
		label({ "for": "remember" }, input({
			type: "checkbox",
			id: "remember",
			name: "remember",
			onchange: onChange,
			checked: isRemember.value
		}), "Remember"),
	)
}

function onLogout() {
	// clear JWT token
	localStorage.removeItem("token")
	jwtToken.set("")
	isRemember.set(false)
	errorMessage.set("")
	//m.redraw()
}

/**
 * @param {SubmitEvent} event
 */
async function onSubmit(event) {
	event.preventDefault()

	// reset error message
	errorMessage.set("")

	// check is loading already
	if (isLoading.value) return

	/** @type {HTMLFormElement} */
	// @ts-ignore
	const formElement = event.currentTarget
	if (!formElement) return

	const username = formElement.username?.value ?? ""
	const password = formElement.password?.value ?? ""
	const email = formElement.email?.value ?? ""

	formElement.reset()

	// save credentials to local storage
	// if (isRemember) {
	// 	saveCredentials(username, password)
	// } else {
	// 	removeCredentials()
	// }

	// register or login
	isLoading.set(true)
	if (isRegister.value) {
		try {
			await Auth.register(username, password, email, isRemember.value)
		} catch (e) {
			console.log("register failed", e.message)
			errorMessage.set(e.message)
		}
	} else {
		// do login with JWT token when it exists
		if (jwtToken.value) {
			try {
				await Auth.loginToken(jwtToken.value, isRemember.value)
			} catch (e) {
				console.log("login (token) failed", e.message)
				errorMessage.set(e.message)
			}
		} else {
			// do login with username & password
			try {
				await Auth.login(username, password, isRemember.value)
			} catch (e) {
				console.log("login failed", e.message)
				errorMessage.set(e.message)
			}
		}
	}
	isLoading.set(false)
	// success, move to next view
	// window.location.href = nextView
}

/**
 * @param {Event} event
 */
function onChange(event) {
	// @ts-ignore tested, id exists
	switch (event.target.id) {
		case "register":
			// @ts-ignore tested, checked exists
			isRegister.set(event.target.checked)
			errorMessage.set("") // reset error message
			// m.redraw()
			break;
		case "remember":
			// @ts-ignore tested, checked exists
			isRemember.set(event.target.checked)
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
// 	localStorage.setIteusername", username)
// 	localStorage.setItepassword", password)
// }

// /**
//  * Removes the saved username and password from local storage.
//  */
// removeCredentials() {
// 	localStorage.removeIteusername")
// 	localStorage.removeItepassword")
// }

// /**
//  * Get the saved username and password from local storage.
//  * @returns {{username: string, password: string}} - The saved credentials.
//  */
// getCredentials() {
// 	return {
// 		username: localStorage.getIteusername") || "",
// 		password: localStorage.getItepassword") || "",
// 	}
// }

