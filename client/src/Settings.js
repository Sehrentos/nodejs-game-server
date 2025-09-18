/**
 * global settings for the client side
 *
 * Note: process.env properties are exposed by webpack
 */
export const DEBUG = true

/** @type {string} - Host address */
export const HOST = process.env.HOST || "127.0.0.1"

/** @type {number} - Port number */
export const PORT = Number(process.env.PORT) || 3000

/** @type {boolean} - Base URL */
export const SSL_ENABLED = process.env.SSL_ENABLED === "true" ? true : false

/** @type {number} - FPS limit */
export const FPS_LIMIT = 60

/** @type {string} - WebSocket address */
export const SOCKET_URL = `${SSL_ENABLED ? "wss" : "ws"}://${HOST}:${PORT}/world`

/** @type {string} - Font family */
export const FONT_FAMILY = "Arial"

/** @type {number} - Font size */
export const FONT_SIZE = 10

/** @type {number} Font width ratio * font size */
export const FONT_WIDTH_RATIO = 0.45
