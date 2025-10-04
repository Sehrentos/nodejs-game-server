/**
 * The entity types
 */
export const TYPE = {
	NPC: 0,
	PLAYER: 1,
	MONSTER: 2,
	PORTAL: 3,
	PET: 4
}

/**
 * The entity directions
 * - 0 Left (x--)
 * - 1 Right (x++)
 * - 2 Up (y--)
 * - 3 Down (y++)
 */
export const DIR = {
	LEFT: 0,
	RIGHT: 1,
	UP: 2,
	DOWN: 3
}

/**
 * The entity sizes
 */
export const SIZE = {
	TINY: 32,
	SMALL: 48,
	MEDIUM: 64,
	LARGE: 96,
	HUGE: 128,
	GIANT: 192
}

// /**
//  * The entity size names
//  */
// export const SIZE_NAME = {
// 	[SIZE.TINY]: "Tiny",
// 	[SIZE.SMALL]: "Small",
// 	[SIZE.MEDIUM]: "Medium",
// 	[SIZE.LARGE]: "Large",
// 	[SIZE.HUGE]: "Huge",
// 	[SIZE.GIANT]: "Giant"
// }

/**
 * The entity attack ranges
 */
export const RANGE = {
	SHORT: 32,
	MEDIUM: 64,
	LONG: 128,
}
