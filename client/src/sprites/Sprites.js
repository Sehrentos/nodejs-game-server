import Sprite from './Sprite.js';

const PATH_MAPS = '/assets/maps/';
const PATH_SPRITES = '/assets/sprites/';

const NO_FRAMES = [];
const RGB_255 = { r: 255, g: 255, b: 255 }

/**
 * Map sprites data
 */
export const MAP = {}
MAP[1] = new Sprite(PATH_MAPS + 'map_1.jpg')
MAP[2] = new Sprite(PATH_MAPS + 'map_2.jpg')
MAP[3] = new Sprite(PATH_MAPS + 'map_3.jpg')
MAP[4] = new Sprite(PATH_MAPS + 'map_4.jpg')
MAP[5] = new Sprite(PATH_MAPS + 'map_5.jpg')
MAP[6] = new Sprite(PATH_MAPS + 'map_6.jpg') // plain fields 1
MAP[7] = new Sprite(PATH_MAPS + 'map_7.jpg') // plain fields 2

/**
 * Player sprites data
 */
export const PLAYER = {}
PLAYER[1] = new Sprite(PATH_SPRITES + 'player_1.png', [
	[665, 966, 0, 0], // front
	[665, 966, 0, 1], // back
	[655, 966, 0, 2], // left
	[655, 966, 0, 3], // right
], RGB_255)
PLAYER[2] = new Sprite(PATH_SPRITES + 'player_2.png', [
	[665, 704, 0, 0], // front
	[665, 704, 0, 1], // back
	[655, 704, 0, 3], // left
	[655, 704, 0, 2], // right
], RGB_255)

/**
 * NPC sprites data
 */
export const NPC = {}
NPC[1] = new Sprite(PATH_SPRITES + 'npc_1.png', NO_FRAMES, RGB_255)
NPC[2] = new Sprite(PATH_SPRITES + 'npc_2.png', NO_FRAMES, RGB_255)
NPC[3] = new Sprite(PATH_SPRITES + 'npc_3.png', NO_FRAMES, RGB_255)
NPC[4] = new Sprite(PATH_SPRITES + 'npc_4.png', NO_FRAMES, RGB_255)
NPC[5] = NPC[1] // Stranger use same sprite as townsfolk


/**
 * Mob sprites data
 */
export const MOB = {}
MOB[1] = new Sprite(PATH_SPRITES + 'mob_1.png', NO_FRAMES, RGB_255)
MOB[2] = new Sprite(PATH_SPRITES + 'mob_2.png', [
	[315, 300, 0, 0],
	[315, 300, 0, 1],
], RGB_255)
MOB[3] = new Sprite(PATH_SPRITES + 'mob_3.png', [
	[391, 300, 0, 0],
	[391, 300, 0, 1],
], RGB_255)
MOB[4] = new Sprite(PATH_SPRITES + 'mob_4.png', [
	[400, 300, 0, 0],
	[400, 300, 0, 1],
], RGB_255)
MOB[5] = new Sprite(PATH_SPRITES + 'mob_5.png', [
	[222, 300, 0, 0],
	[222, 300, 0, 1],
], RGB_255)
MOB[6] = new Sprite(PATH_SPRITES + 'mob_6.png', [
], RGB_255)
MOB[7] = new Sprite(PATH_SPRITES + 'mob_7.png', [
	[151, 300, 0, 0],
	[151, 300, 0, 1],
], RGB_255)
MOB[8] = new Sprite(PATH_SPRITES + 'mob_8.png', [
	[300, 300, 0, 0],
	[300, 300, 0, 1],
], RGB_255)
MOB[9] = new Sprite(PATH_SPRITES + 'mob_9.png', [
	[276, 300, 0, 0],
	[276, 300, 0, 1],
], RGB_255)
MOB[10] = new Sprite(PATH_SPRITES + 'mob_10.png', [
], RGB_255)
MOB[11] = new Sprite(PATH_SPRITES + 'mob_11.png', NO_FRAMES, RGB_255)
MOB[12] = new Sprite(PATH_SPRITES + 'mob_12.png', [
	[338, 300, 0, 0],
	[338, 300, 0, 1],
], RGB_255)
MOB[13] = new Sprite(PATH_SPRITES + 'mob_13.png', [
	[160, 300, 0, 0],
	[160, 300, 0, 1],
], RGB_255)
MOB[14] = new Sprite(PATH_SPRITES + 'mob_14.png', NO_FRAMES, RGB_255)
MOB[15] = new Sprite(PATH_SPRITES + 'mob_15.png', [
	[275, 300, 0, 0],
	[275, 300, 0, 1],
], RGB_255)
MOB[16] = new Sprite(PATH_SPRITES + 'mob_16.png', [
	[306, 300, 0, 0],
	[306, 300, 0, 1], // back
	[306, 300, 0, 2], // left
	[306, 300, 0, 3], // right
], RGB_255)
MOB[17] = new Sprite(PATH_SPRITES + 'snake_1.png', [
	[306, 300, 0, 0],
	[306, 300, 0, 1], // back
	[306, 300, 0, 2], // left
	[306, 300, 0, 3], // right
], RGB_255)
MOB[18] = new Sprite(PATH_SPRITES + 'cat_2.png', [
	[306, 300, 0, 0],
	[306, 300, 0, 1], // back
	[306, 300, 0, 2], // left
	[306, 300, 0, 3], // right
], RGB_255)
MOB[19] = new Sprite(PATH_SPRITES + 'dog_1.png', [
	[222, 300, 0, 0], // front
	[222, 300, 0, 1], // back
	[222, 300, 0, 2], // left
	[222, 300, 0, 3], // right
], RGB_255)
MOB[20] = new Sprite(PATH_SPRITES + 'frog_1.png', [
	[250, 300, 0, 0],
	[240, 300, 0, 1], // back
	[250, 300, 0, 3], // left
	[250, 300, 0, 2], // right
], RGB_255)
