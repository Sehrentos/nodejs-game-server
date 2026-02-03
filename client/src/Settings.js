/**
 * global settings for the client side
 *
 * Note: process.env properties are exposed by webpack
 */
const isSecure = location.protocol === "https:"

export const DEBUG = true

/** @type {number} - FPS limit */
export const FPS_LIMIT = 60

/** @type {string} - WebSocket address */
export const SOCKET_URL = process.env.WS_URL || `${isSecure ? "wss" : "ws"}://127.0.0.1:3000/world`

/** @type {string} - Font family */
export const FONT_FAMILY = "Arial"

/** @type {number} - Font size */
export const FONT_SIZE = 10

/** @type {number} Font width ratio * font size */
export const FONT_WIDTH_RATIO = 0.45
