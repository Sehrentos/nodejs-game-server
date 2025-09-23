import Observable from "./utils/Observable.js";

/**
 * Authentication module to handle user login, registration, and token management.
 */
export class Auth {
	constructor() {
		this.isLoggedIn = new Observable(false)
		this.jwtToken = new Observable(localStorage.getItem("token") || "")
	}

	/**
	 * Logs into the game server with the given username and password.
	 * If there is no username or password given, an empty string is used.
	 * If the game is already running, it throws an error.
	 * @param {string} [username=""] - The username to log in with.
	 * @param {string} [password=""] - The password to log in with.
	 * @param {boolean} [saveCredentials=false] - Whether to save the credentials to local storage.
	 * @throws {Error} If the game is already running or if the login fails.
	 * @returns {Promise<boolean>} - True if the login was successful, false otherwise.
	 */
	async login(username = "", password = "", saveCredentials = false) {
		if (this.isLoggedIn.value) {
			throw new Error("Already logged in.");
		}
		// sent the POST /login request,
		// then await for token as response {token:string,...}
		// and then start the game
		const response = await fetch("/api/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ username, password })
		});
		const data = await response.json()

		if (!data.token) {
			throw new Error("Login failed.")
		}

		// has used decided to save credentials
		if (saveCredentials) {
			localStorage.setItem("token", data.token)
		} else {
			localStorage.removeItem("token")
		}

		this.jwtToken.set(data.token)
		this.isLoggedIn.set(true)
		return true
	}

	/**
	 * Logs into the game server with the given JWT token.
	 * If there is no token given, an empty string is used.
	 * If the game is already running, it throws an error.
	 * @param {string} [token=""] - The JWT token to log in with.
	 * @param {boolean} [saveCredentials=false] - Whether to save the credentials to local storage.
	 * @throws {Error} If the game is already running or if the login fails.
	 * @returns {Promise<boolean>} - True if the login was successful, false otherwise.
	 */
	async loginToken(token = "", saveCredentials = false) {
		if (this.isLoggedIn.value) {
			throw new Error("Already logged in.");
		}
		// sent the POST /login/token request,
		// then await for token as response {token:string,...}
		// and then start the game
		const response = await fetch("/api/login/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ token })
		});
		const data = await response.json()

		if (data.type === "error") {
			throw new Error(data.message)
		}

		if (!data.token) {
			throw new Error("Login failed.")
		}

		// has used decided to save credentials
		if (saveCredentials) {
			localStorage.setItem("token", data.token)
		} else {
			localStorage.removeItem("token")
		}

		this.jwtToken.set(data.token)
		this.isLoggedIn.set(true)
		return true
	}

	/**
	 * Registers a new user with the given username, password and email.
	 * If the game is already running, it throws an error.
	 * @param {string} [username=""] - The username to register with.
	 * @param {string} [password=""] - The password to register with.
	 * @param {string} [email=""] - The email to register with.
	 * @param {boolean} [saveCredentials=false] - Whether to save the credentials to local storage.
	 * @throws {Error} If the game is already running or if the registration fails.
	 * @returns {Promise<boolean>} - True if the registration was successful, false otherwise.
	 */
	async register(username = "", password = "", email = "", saveCredentials = false) {
		if (this.isLoggedIn.value) {
			throw new Error("Already logged in.");
		}
		// sent the POST /register request,
		// then await for token as response {token:string,...}
		// and then start the game
		const response = await fetch("/api/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ username, password, email })
		});
		const data = await response.json();

		if (!data.token) {
			throw new Error("Register failed.");
		}

		// has used decided to save credentials
		if (saveCredentials) {
			localStorage.setItem("token", data.token)
		} else {
			localStorage.removeItem("token")
		}

		this.jwtToken.set(data.token)
		this.isLoggedIn.set(true)
		return true
	}

	/**
	 * Clears the JWT token and sets the logged in state to false.
	 */
	reset() {
		localStorage.removeItem("token")
		this.jwtToken.set("")
		this.isLoggedIn.set(false)
	}
}

/**
 * Singleton instance of the Auth class.
 */
const auth = new Auth()
export default auth
