export const Auth = {
    isLoggedIn: false,
    jwtToken: "",

    /**
     * Logs into the game server with the given username and password.
     * If there is no username or password given, an empty string is used.
     * If the game is already running, it throws an error.
     * @param {string} [username=""] - The username to log in with.
     * @param {string} [password=""] - The password to log in with.
     * @throws {Error} If the game is already running or if the login fails.
     * @returns {Promise<boolean>} - True if the login was successful, false otherwise.
     */
    login: async (username = "", password = "") => {
        if (Auth.isLoggedIn) {
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

        Auth.jwtToken = data.token
        Auth.isLoggedIn = true
        return true
    },

    /**
     * Registers a new user with the given username, password and email.
     * If the game is already running, it throws an error.
     * @param {string} [username=""] - The username to register with.
     * @param {string} [password=""] - The password to register with.
     * @param {string} [email=""] - The email to register with.
     * @throws {Error} If the game is already running or if the registration fails.
     * @returns {Promise<boolean>} - True if the registration was successful, false otherwise.
     */
    register: async (username = "", password = "", email = "") => {
        if (Auth.isLoggedIn) {
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

        Auth.jwtToken = data.token
        Auth.isLoggedIn = true
        return true
    },
}