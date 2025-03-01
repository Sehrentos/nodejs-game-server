/**
 * The server update interval in milliseconds
 */
export const UPDATE_TICK = 1000 / 60 // or 1000/60
/**
 * maximum length of the message player can send to the socket
 */
export const SOCKET_MESSAGE_MAX_SIZE = 250
export const SOCKET_HEARTBEAT_INTERVAL = 5000

export const COOLDOWN_SOCKET_SEND_MAP = 60
export const COOLDOWN_SOCKET_SEND_PLAYER = 5000
export const COOLDOWN_PORTAL_USE = 5000

/**
 * **Monster** The time in milliseconds after which an entity will be automatically revived.
 */
export const ENTITY_AUTO_REVIVE_TIME = 5 * 60 * 1000 // 5 minutes
/**
 * **Monster** The time in milliseconds the entity will idle, before moving.
 */
export const ENTITY_AI_IDDLE_TIME = 5000 // 5 seconds
/**
 * **Monster** The max distance in pixels from 
 * the original position that the entity can move. 
 * While idle.
 */
export const ENTITY_AI_IDDLE_MOVE_MAX = 30 // pixels
/**
 * **Monster** The range in pixels to detect other entities.
 */
export const ENTITY_AI_NEARBY_RANGE = 80

/**
 * The step in pixels to move the entity per tick.
 */
export const ENTITY_MOVE_STEP = 2
export const ENTITY_RANGE = 32
export const ENTITY_WIDTH = 64
export const ENTITY_HEIGHT = 64
export const ENTITY_LAST_MAP = "Lobby town"
export const ENTITY_LAST_X = 875
export const ENTITY_LAST_Y = 830
export const ENTITY_MOVE_SPEED = 400
export const ENTITY_ATK_SPEED = 1000
export const ENTITY_CAST_SPEED = 1000
export const ENTITY_HP_REGEN_RATE = 5000
export const ENTITY_MP_REGEN_RATE = 5000

/**
 * The touch area size (in pixels) to find targets, 
 * when player click/touch screen.
 * Set same value in the client-side code.
 */
export const PLAYER_TOUCH_AREA_SIZE = 25
/**
 * The view area size (in pixels) to find entities.
 * Found entities will be sent to the client. Set `0` for no limit.
 */
export const PLAYER_VIEW_AREA_SIZE = 0 // was 400

// #region Player experience
export const EXP_BASE = 200
export const EXP_JOB = 100
// #endregion

// #region Player stats increased by level
export const PLAYER_BASE_HP = 100
export const PLAYER_BASE_HP_REGEN = 10
export const PLAYER_BASE_MP = 50
export const PLAYER_BASE_MP_REGEN = 5
// all base stats
export const PLAYER_BASE_STR = 5
export const PLAYER_BASE_AGI = 5
export const PLAYER_BASE_INT = 5
export const PLAYER_BASE_VIT = 5
export const PLAYER_BASE_DEX = 5
export const PLAYER_BASE_LUK = 5
// attack
export const PLAYER_BASE_ATK = 5
export const PLAYER_BASE_MATK = 5
// defence
export const PLAYER_BASE_DEF = 1.5
export const PLAYER_BASE_MDEF = 1.5
// #endregion
