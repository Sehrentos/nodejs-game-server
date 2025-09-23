import "./Login.css"
import { tags } from "./index.js"
import auth from "../Auth.js"
import Observable from "../utils/Observable.js"

const { main, form, div, p, header, input, label } = tags

const isRegister = new Observable(false)
const isLoading = new Observable(false)
const stateMessage = new Observable("")
const isRemember = new Observable(localStorage.getItem("remember") === "true" ? true : false)

const stateMessageView = div({ class: "response" }, stateMessage.value)
const container = main({ class: "ui card ui-login centered open" }, LoginForm())

const onStopPropagation = (event) => event.stopPropagation()
container.addEventListener("selectstart", onStopPropagation)
container.addEventListener("contextmenu", onStopPropagation)

// subscribe to state changes for UI updates
isRegister.subscribe((value) => {
	container.replaceChildren(value ? RegisterForm() : LoginForm())
})

isLoading.subscribe((value) => {
	if (value == null) return
	// disable all buttons and inputs while loading
	container.querySelectorAll("input").forEach((button) => button.disabled = value)
})

stateMessage.subscribe((message) => {
	if (message == null) return
	stateMessageView.replaceChildren(message)
})

// auth.jwtToken.subscribe((token) => refresh())

// hide login UI when logged in
auth.isLoggedIn.subscribe((isLoggedIn) => {
	if (isLoggedIn) {
		container.classList.remove("open")
	} else {
		container.classList.add("open")
	}
})

/**
 * Renders the UI based on the current state of the isRegister observable.
 * @returns {void}
 */
const refresh = () => container.replaceChildren(isRegister.value ? RegisterForm() : LoginForm())

/**
 * An Login or Register UI component
 * @returns {HTMLElement}
 */
export default function LoginUI() {
	if (isRegister.value) {
		// swap to register
		container.replaceChildren(RegisterForm())
	}
	return container
}

/**
 * A LoginForm component to render a login form.
 * If a JWT token exists, hides the username and password fields and shows a logout button.
 * If no JWT token exists, shows the username and password fields.
 * @returns {HTMLElement} - The rendered form element
 */
function LoginForm() {
	return form(
		{
			name: "login",
			autocomplete: "off",
			onsubmit: onSubmit,
		},
		header("Login"),
		p("Note: This is only for testing purposes."),
		p("Login with your account to play the game."),
		stateMessageView,
		// hide username field when JWT token exists
		auth.jwtToken.value ? null : input({
			type: "text",
			name: "username",
			id: "username",
			placeholder: "Username",
			// value: credentials.username,
			required: true,
			autofocus: true,
		}),
		// hide password field when JWT token exists
		auth.jwtToken.value ? null : input({
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
			value: auth.jwtToken.value ? "Start Game" : "Login",
			disabled: isLoading.value
		}),
		// show logout button when JWT token exists
		auth.jwtToken.value ? input({
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

/**
 * Returns a form element with inputs for username, password, and email,
 * a submit button with the label "Register", and checkboxes for "Register" and "Remember".
 * The form is submitted to the onSubmit function and has its autocomplete set to "off".
 * The form also shows a state message view.
 * @returns {HTMLElement} - The form element.
 */
function RegisterForm() {
	return form(
		{
			name: "register",
			autocomplete: "off",
			onsubmit: onSubmit,
		},
		header("Register"),
		p("Note: This is only for testing purposes."),
		p("Register an account to play the game."),
		stateMessageView,
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

/**
 * Resets the JWT token and logged in state, and sets the remember checkbox to false.
 * It also clears the state message.
 */
function onLogout() {
	auth.reset() // clear JWT token & logged in state
	stateMessage.set("")
	refresh()
}

/**
 * @param {SubmitEvent} event
 */
async function onSubmit(event) {
	event.preventDefault()

	// reset state message
	stateMessage.set("")

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

	// update state
	isLoading.set(true)
	let message = "Loading..."
	stateMessage.set(message)

	// do register or login
	if (isRegister.value) {
		try {
			await auth.register(username, password, email, isRemember.value)
			message = "Registration successful"
		} catch (e) {
			console.log("register failed", e.message)
			message = e.message
		}
	} else {
		// do login with JWT token when it exists
		if (auth.jwtToken.value) {
			try {
				await auth.loginToken(auth.jwtToken.value, isRemember.value)
				message = "Login successful"
			} catch (e) {
				console.log("login (token) failed", e.message)
				message = e.message
			}
		} else {
			// do login with username & password
			try {
				await auth.login(username, password, isRemember.value)
				message = "Login successful"
			} catch (e) {
				console.log("login failed", e.message)
				message = e.message
			}
		}
	}
	isLoading.set(false)
	stateMessage.set(message)
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
			stateMessage.set("") // reset error message
			break;
		case "remember":
			// @ts-ignore tested, checked exists
			isRemember.set(event.target.checked)
			localStorage.setItem("remember", isRemember.value.toString())
			break;
		default:
			break;
	}
}
