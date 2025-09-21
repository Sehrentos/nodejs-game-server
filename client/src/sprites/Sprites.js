import Sprite from './Sprite.js';
import { SPRITE as SPR } from '../../../shared/enum/Sprite.js';

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
PLAYER[SPR.PLAYER1] = new Sprite(PATH_SPRITES + 'player_1.png', [
	[665, 966, 0, 0], // front
	[665, 966, 0, 1], // back
	[655, 966, 0, 2], // left
	[655, 966, 0, 3], // right
], RGB_255)
PLAYER[SPR.PLAYER2] = new Sprite(PATH_SPRITES + 'player_2.png', [
	[665, 704, 0, 0], // front
	[665, 704, 0, 1], // back
	[655, 704, 0, 3], // left
	[655, 704, 0, 2], // right
], RGB_255)

/**
 * NPC sprites data
 */
export const NPC = {}
NPC[SPR.TOWNSFOLK] = new Sprite(PATH_SPRITES + 'npc_1.png', NO_FRAMES, RGB_255)
NPC[SPR.BLACKSMITH] = new Sprite(PATH_SPRITES + 'npc_2.png', NO_FRAMES, RGB_255)
NPC[SPR.TOOL_DEALER] = new Sprite(PATH_SPRITES + 'npc_3.png', NO_FRAMES, RGB_255)
NPC[SPR.MERCHANT] = new Sprite(PATH_SPRITES + 'npc_4.png', NO_FRAMES, RGB_255)
NPC[SPR.STRANGER] = NPC[SPR.TOWNSFOLK] // Stranger use same sprite as townsfolk

/**
 * Mob sprites data
 */
export const MOB = {}
MOB[SPR.CAT] = new Sprite(PATH_SPRITES + 'mob_1.png', NO_FRAMES, RGB_255)
MOB[SPR.ORC] = new Sprite(PATH_SPRITES + 'mob_2.png', [
	[315, 300, 0, 0],
	[315, 300, 0, 1],
], RGB_255)
MOB[SPR.PLANKTON] = new Sprite(PATH_SPRITES + 'mob_3.png', [
	[391, 300, 0, 0],
	[391, 300, 0, 1],
], RGB_255)
MOB[SPR.ORC2] = new Sprite(PATH_SPRITES + 'mob_4.png', [
	[400, 300, 0, 0],
	[400, 300, 0, 1],
], RGB_255)
MOB[SPR.EYE] = new Sprite(PATH_SPRITES + 'mob_5.png', [
	[222, 300, 0, 0],
	[222, 300, 0, 1],
], RGB_255)
MOB[SPR.LADYBUG] = new Sprite(PATH_SPRITES + 'mob_6.png', [
], RGB_255)
MOB[SPR.SKELETON] = new Sprite(PATH_SPRITES + 'mob_7.png', [
	[151, 300, 0, 0],
	[151, 300, 0, 1],
], RGB_255)
MOB[SPR.DINOSAUR] = new Sprite(PATH_SPRITES + 'mob_8.png', [
	[300, 300, 0, 0],
	[300, 300, 0, 1],
], RGB_255)
MOB[SPR.MUSHROOM] = new Sprite(PATH_SPRITES + 'mob_9.png', [
	[276, 300, 0, 0],
	[276, 300, 0, 1],
], RGB_255)
MOB[SPR.WIND_SPIRIT] = new Sprite(PATH_SPRITES + 'mob_10.png', [
], RGB_255)
MOB[SPR.SLUSHIE] = new Sprite(PATH_SPRITES + 'mob_11.png', NO_FRAMES, RGB_255)
MOB[SPR.RED_MUSHROOM] = new Sprite(PATH_SPRITES + 'mob_12.png', [
	[338, 300, 0, 0],
	[338, 300, 0, 1],
], RGB_255)
MOB[SPR.LADYBUG2] = new Sprite(PATH_SPRITES + 'mob_13.png', [
	[160, 300, 0, 0],
	[160, 300, 0, 1],
], RGB_255)
MOB[SPR.ROBOT] = new Sprite(PATH_SPRITES + 'mob_14.png', NO_FRAMES, RGB_255)
MOB[SPR.UNICORN] = new Sprite(PATH_SPRITES + 'mob_15.png', [
	[275, 300, 0, 0],
	[275, 300, 0, 1],
], RGB_255)
MOB[SPR.GHOST] = new Sprite(PATH_SPRITES + 'mob_16.png', [
	[306, 300, 0, 0],
	[306, 300, 0, 1], // back
	[306, 300, 0, 2], // left
	[306, 300, 0, 3], // right
], RGB_255)
MOB[SPR.SNAKE] = new Sprite(PATH_SPRITES + 'snake_1.png', [
	[310, 300, 0, 0],
	[325, 300, 0, 1], // back
	[350, 300, 0, 2], // left
	[350, 300, 0, 3], // right
], RGB_255)
MOB[SPR.CAT2] = new Sprite(PATH_SPRITES + 'cat_2.png', [
	[300, 300, 0, 0],
	[300, 300, 0, 1], // back
	[300, 300, 0, 2], // left
	[300, 300, 0, 3], // right
], RGB_255)
MOB[SPR.DOG] = new Sprite(PATH_SPRITES + 'dog_1.png', [
	[222, 300, 0, 0], // front
	[222, 300, 0, 1], // back
	[222, 300, 0, 2], // left
	[222, 300, 0, 3], // right
], RGB_255)
MOB[SPR.FROG] = new Sprite(PATH_SPRITES + 'frog_1.png', [
	[250, 300, 0, 0],
	[240, 300, 0, 1], // back
	[250, 300, 0, 3], // left
	[250, 300, 0, 2], // right
], RGB_255)
