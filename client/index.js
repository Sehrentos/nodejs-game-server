// client-side application entry
import { ENTITY_TYPE } from "../src/enum/Entity.js";
import "./style.css";
import van from "vanjs-core"
const {
    p,
    br,
    div,
    form,
    input,
    label,
    legend,
    canvas,
    fieldset,
} = van.tags;

const WS_ADDRESS = "ws://127.0.0.1:3000/world"
const MOVEMENT_KEYS = "KeyA,KeyD,KeyW,KeyS,ArrowLeft,ArrowRight,ArrowUp,ArrowDown".split(",")

const isLoggedIn = van.state(false)

/** @type {import("vanjs-core").State<import("../src/Packets.js").TWorldMap>} */
let worldMap = van.state(null)

/** @type {import("vanjs-core").State<import("../src/Packets.js").TPlayer>} */
let player = van.state(null)

/** @type {WebSocket} */
let socket = null

/** @type {HTMLCanvasElement} */
const canvasElement = canvas({
    id: 'gameCanvas',
    width: window.innerWidth, // 600,
    height: window.innerHeight, //400,
})

/** @type {CanvasRenderingContext2D} */
const ctx = canvasElement.getContext("2d")

const loginDialogVisibility = van.derive(() => isLoggedIn.val ? 'dialog-backdrop' : 'dialog-backdrop show')

// Login dialog
const loginDialogElement = div({
    id: 'login-dialog',
    class: loginDialogVisibility,
},
    div({
        class: 'dialog',
    },
        form({
            id: 'base-form',
            autocomplete: 'off',
            onsubmit: (event) => {
                event.preventDefault();
                // @ts-ignore
                const username = document.getElementById("username").value;
                // @ts-ignore
                const password = document.getElementById("password").value;
                // reset the form
                (event.target || document.forms['base-form']).reset();
                // do the login and start the game
                login(username, password);
            },
        },
            fieldset(
                legend('Login'),
                p('Login to connect to the server using WebSocket.'),
                p('You can move with WASD and arrow keys.'),
                p('Note: This server is only for testing purposes'),
                p('and any login credentials will be accepted for this demo.'),
                input({
                    type: 'text',
                    name: 'username',
                    id: 'username',
                    placeholder: 'Username',
                    required: true,
                }),
                br(),
                input({
                    type: 'password',
                    name: 'password',
                    id: 'password',
                    placeholder: 'Password',
                    required: true,
                }),
                br(),
                input({
                    type: 'submit',
                    value: 'Submit',
                }),
            )
        )
    )
)

// App container
const App = () => {
    return div(
        canvasElement,
        loginDialogElement
    )
}

// add the app to the DOM
van.add(document.body, App())

/**
 * Logs into the game server with the given username and password.
 * If there is no username or password given, an empty string is used.
 * If the game is already running, it throws an error.
 * @param {string} [username=""] - The username to log in with.
 * @param {string} [password=""] - The password to log in with.
 * @throws {Error} If the game is already running or if the login fails.
 */
async function login(username = "", password = "") {
    if (isLoggedIn.val) {
        throw new Error("Already logged in.");
    }
    // sent the POST /login request,
    // then await for token as response {token:string,expires:number}
    // and then start the game
    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    if (!data.token) {
        throw new Error("Login failed.");
    }

    startGame(data.token);
}

/**
 * Starts the game by establishing a WebSocket connection using the provided token.
 * Paints the canvas black, sets up event listeners for socket events such as open,
 * close, and message, and manages the game state and player interactions.
 * 
 * @param {string} token - The authentication token used to establish the WebSocket connection.
 * @throws {Error} If the game is already running.
 */
function startGame(token) {
    // paint the canvas with black
    fillRect(0, 0, canvasElement.width, canvasElement.height);

    if (isLoggedIn.val) {
        throw new Error("Already logged in.");
    }

    socket = new WebSocket(WS_ADDRESS, ["ws", "wss", `Bearer.${token}`]);

    socket.addEventListener("open", (event) => {
        // our authentication is already done
        isLoggedIn.val = true;
        window.addEventListener("keydown", windowKeydown);
        // TODO how to get correct mouse position in fullscreen?
        // canvasElement.requestFullscreen();
        canvasElement.addEventListener("click", onCanvasClick);
        canvasElement.addEventListener("mousemove", onCanvasMouseMove);
        console.log('Connection opened.');
    });

    socket.addEventListener("close", (event) => {
        console.log("Connection closed.");
        isLoggedIn.val = false;
        worldMap.val = null;
        // player.val = null;
        window.removeEventListener("keydown", windowKeydown);
        canvasElement.removeEventListener("click", onCanvasClick);
        canvasElement.removeEventListener("mousemove", onCanvasMouseMove);
        // paint the canvas with black
        fillRect(0, 0, canvasElement.width, canvasElement.height);
    })

    socket.addEventListener("message", (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === "player") {
                onPlayerJoin(data);
            } else if (data.type === "map") {
                onWorldTick(data);
            }
        } catch (error) {
            console.error("Websocket message error:", error);
        }
    });
}

/**
 * Called when a "join" message is received from the server.
 * Updates the player state (name, map, direction, x, y) and world state.
 * Then calls `drawUpdate` to update the game canvas.
 * @param {import("../src/Packets.js").TPlayerPacket} data - The message data from the server.
 */
function onPlayerJoin(data) {
    // console.log("Player:", data);
    // update player state
    player.val = data.player;
    // TODO update player UI
    // ...
}

/**
 * Called when a "tick" message is received from the server.
 * Updates the player state (name, map, direction, x, y) and world state.
 * Then calls `drawUpdate` to update the game canvas.
 * @param {import("../src/Packets.js").TMapPacket} data - The message data from the server.
 */
function onWorldTick(data) {
    // update world state
    worldMap.val = data.map;
    // update the game
    drawMapUpdate();
}

/**
 * Called when the window receives a keydown event.
 * If the key is a movement key, sends a "move" message to the server with the key code.
 * @param {KeyboardEvent} event - The keydown event.
 * @private
 */
function windowKeydown(event) {
    // console.log(event.type, event.code, event.key)
    if (MOVEMENT_KEYS.includes(event.code)) {
        socket.send(JSON.stringify({ type: "move", code: event.code }));
    }
}

// TODO how to get correct mouse position in fullscreen
function getMousePosition(element, event) {
    let rect = element.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return { x, y };
}

function onCanvasMouseMove(e) {
    if (worldMap.val == null) return
    const { x, y } = getMousePosition(canvasElement, e);
    const stack = findEntitiesInRadius(x, y, 8)

    // change mouse cursor to pointer
    if (stack.length) {
        canvasElement.style.cursor = "pointer"
    } else {
        canvasElement.style.cursor = "default"
    }
}

function onCanvasClick(e) {
    if (worldMap.val == null) return
    const { x, y } = getMousePosition(canvasElement, e);
    const stack = findEntitiesInRadius(x, y, 8)
    console.log(x, y, stack)

    // send a "click" message to the server
    socket.send(JSON.stringify({ type: "click", x, y }));
}


/**
 * Finds entities in the given radius around a specific point.
 * 
 * @param {number} x - The x-coordinate of the center point.
 * @param {number} y - The y-coordinate of the center point.
 * @param {number} radius - The radius to search for entities.
 * @returns {Array} - An array of entities within the specified radius.
 */
function findEntitiesInRadius(x, y, radius) {
    const stack = [] // entities can be on top of each other
    if (worldMap.val == null) return stack
    const entities = worldMap.val.entities
    let _x, _y
    for (const entity of entities) {
        _x = entity.x
        _y = entity.y
        if (Math.abs(x - _x) > radius || Math.abs(y - _y) > radius) continue
        stack.push(entity)
    }
    return stack
}

/**
 * Called by the game loop to update the game canvas.
 * Updates the canvas size if the width or height have changed.
 * Paints the canvas with green.
 * Draws all entities in the game world.
 */
function drawMapUpdate() {
    const data = worldMap.val
    // update max size by server data
    if (data.width) canvasElement.width = data.width;
    if (data.height) canvasElement.height = data.height;

    // paint the canvas with green
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // draw the NPCs
    data.entities.forEach((entity) => {
        if (entity.type === ENTITY_TYPE.NPC) {
            drawRect("brown", entity.x, entity.y, 8, 8);
            // display the entity name as text in the canvas
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
            ctx.fillText(entity.name, (entity.x - (entity.name.length * 2)), (entity.y - 2));
        }
        else if (entity.type === ENTITY_TYPE.PLAYER) {
            drawCircle("black", entity.x, entity.y, 8);
            // display the username as text in the canvas
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
            ctx.fillText(entity.name, (entity.x - (entity.name.length * 2.5)), (entity.y - 8));
        }
        else if (entity.type === ENTITY_TYPE.MONSTER) {
            drawCircle("red", entity.x, entity.y, 4);
            // display the username as text in the canvas
            ctx.fillStyle = "red";
            ctx.font = "10px Arial";
            ctx.fillText(entity.name, (entity.x - (entity.name.length * 2.5)), (entity.y - 8));
        }
        else if (entity.type === ENTITY_TYPE.WARP_PORTAL) {
            drawCircle("blue", entity.x, entity.y, 8);
            // display the username as text in the canvas
            ctx.fillStyle = "blue";
            ctx.font = "10px Arial";
            ctx.fillText(entity.name, (entity.x - (entity.name.length * 2.5)), (entity.y - 8));
        }
    });
}

/**
 * Fills a rectangle on the canvas with a specified width and height,
 * starting from the given x and y coordinates.
 * The rectangle is filled with the current fill style color.
 *
 * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
 * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 */
function fillRect(x, y, width, height) {
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, width, height);
}

/**
 * Draws a rectangle on the canvas with the given dimensions and
 * position. The rectangle is filled with the current fill style color,
 * or red if no fill color is provided.
 *
 * @param {string} fill - The fill color of the rectangle.
 * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
 * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 */
function drawRect(fill, x, y, width, height) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = fill || "red";
    ctx.fill();
}

/**
 * Draws a circle on the canvas with the given radius and position.
 * The circle is filled with the current fill style color,
 * or red if no fill color is provided.
 *
 * @param {string} fill - The fill color of the circle.
 * @param {number} x - The x-coordinate of the center of the circle.
 * @param {number} y - The y-coordinate of the center of the circle.
 * @param {number} radius - The radius of the circle.
 */
function drawCircle(fill, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fill || "red";
    ctx.fill();
}