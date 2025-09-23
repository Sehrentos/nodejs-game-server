import Sprite from './Sprite.js';
import { SPR_ID } from '../../../shared/enum/Sprite.js';

const PATH_MAPS = '/assets/maps/';
const PATH_SPRITES = '/assets/sprites/';

const NO_FRAMES = [];
const RGB_255 = { r: 255, g: 255, b: 255 }

/**
 * All sprites
 *
 * @type {{[key: number]: Sprite}}
 * @example
 * import { SPRITES } from './sprites/Sprites.js'
 * const sprite = SPRITES[entity.spriteId]
 */
const SPR = {}

// #region Maps

SPR[SPR_ID.MAP_LOBBY_TOWN] = new Sprite(PATH_MAPS + 'map_1.jpg')
SPR[SPR_ID.MAP_FLOWER_TOWN] = new Sprite(PATH_MAPS + 'map_2.jpg')
SPR[SPR_ID.MAP_CAR_TOWN] = new Sprite(PATH_MAPS + 'map_3.jpg')
SPR[SPR_ID.MAP_UNDER_WATER_1] = new Sprite(PATH_MAPS + 'map_4.jpg')
SPR[SPR_ID.MAP_UNDER_WATER_2] = new Sprite(PATH_MAPS + 'map_5.jpg')
SPR[SPR_ID.MAP_PLAIN_FIELDS_1] = new Sprite(PATH_MAPS + 'map_6.jpg')
SPR[SPR_ID.MAP_PLAIN_FIELDS_2] = new Sprite(PATH_MAPS + 'map_7.jpg')

// #endregion

// #region Players

SPR[SPR_ID.PLAYER_MALE] = new Sprite(PATH_SPRITES + 'player_1.png', [
	[665, 966, 0, 0], // front
	[665, 966, 0, 1], // back
	[655, 966, 0, 2], // left
	[655, 966, 0, 3], // right
], RGB_255)
SPR[SPR_ID.PLAYER_FEMALE] = new Sprite(PATH_SPRITES + 'player_2.png', [
	[640, 704, 0, 0], // front
	[640, 704, 0, 1], // back
	[640, 704, 0, 3], // left
	[640, 704, 0, 2], // right
], RGB_255)

// #endregion

// #region NPCs

SPR[SPR_ID.NPC_TOWNSFOLK] = new Sprite(PATH_SPRITES + 'npc_1.png', NO_FRAMES, RGB_255)
SPR[SPR_ID.NPC_BLACKSMITH] = new Sprite(PATH_SPRITES + 'npc_2.png', NO_FRAMES, RGB_255)
SPR[SPR_ID.NPC_TOOL_DEALER] = new Sprite(PATH_SPRITES + 'npc_3.png', NO_FRAMES, RGB_255)
SPR[SPR_ID.NPC_MERCHANT] = new Sprite(PATH_SPRITES + 'npc_4.png', NO_FRAMES, RGB_255)
SPR[SPR_ID.NPC_STRANGER] = SPR[SPR_ID.NPC_TOWNSFOLK] // Stranger use same sprite as townsfolk

// #endregion

// #region Monsters

SPR[SPR_ID.MOB_CAT] = new Sprite(PATH_SPRITES + 'mob_1.png', NO_FRAMES, RGB_255)
SPR[SPR_ID.MOB_ORC] = new Sprite(PATH_SPRITES + 'mob_2.png', [
	[315, 300, 0, 0],
	[315, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_PLANKTON] = new Sprite(PATH_SPRITES + 'mob_3.png', [
	[391, 300, 0, 0],
	[391, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_ORC2] = new Sprite(PATH_SPRITES + 'mob_4.png', [
	[400, 300, 0, 0],
	[400, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_EYE] = new Sprite(PATH_SPRITES + 'mob_5.png', [
	[222, 300, 0, 0],
	[222, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_LADYBUG] = new Sprite(PATH_SPRITES + 'mob_6.png', [
], RGB_255)
SPR[SPR_ID.MOB_SKELETON] = new Sprite(PATH_SPRITES + 'mob_7.png', [
	[151, 300, 0, 0],
	[151, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_DINOSAUR] = new Sprite(PATH_SPRITES + 'mob_8.png', [
	[300, 300, 0, 0],
	[300, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_MUSHROOM] = new Sprite(PATH_SPRITES + 'mob_9.png', [
	[276, 300, 0, 0],
	[276, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_WIND_SPIRIT] = new Sprite(PATH_SPRITES + 'mob_10.png', [
], RGB_255)
SPR[SPR_ID.MOB_SLUSHIE] = new Sprite(PATH_SPRITES + 'mob_11.png', NO_FRAMES, RGB_255)
SPR[SPR_ID.MOB_RED_MUSHROOM] = new Sprite(PATH_SPRITES + 'mob_12.png', [
	[338, 300, 0, 0],
	[338, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_LADYBUG2] = new Sprite(PATH_SPRITES + 'mob_13.png', [
	[160, 300, 0, 0],
	[160, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_ROBOT] = new Sprite(PATH_SPRITES + 'mob_14.png', NO_FRAMES, RGB_255)
SPR[SPR_ID.MOB_UNICORN] = new Sprite(PATH_SPRITES + 'mob_15.png', [
	[275, 300, 0, 0],
	[275, 300, 0, 1],
], RGB_255)
SPR[SPR_ID.MOB_GHOST] = new Sprite(PATH_SPRITES + 'mob_16.png', [
	[306, 300, 0, 0],
	[306, 300, 0, 1], // back
	[306, 300, 0, 2], // left
	[306, 300, 0, 3], // right
], RGB_255)
SPR[SPR_ID.MOB_SNAKE] = new Sprite(PATH_SPRITES + 'snake_1.png', [
	[310, 300, 0, 0],
	[325, 300, 0, 1], // back
	[350, 300, 0, 2], // left
	[350, 300, 0, 3], // right
], RGB_255)
SPR[SPR_ID.MOB_CAT2] = new Sprite(PATH_SPRITES + 'cat_2.png', [
	[300, 300, 0, 0],
	[300, 300, 0, 1], // back
	[300, 300, 0, 2], // left
	[300, 300, 0, 3], // right
], RGB_255)
SPR[SPR_ID.MOB_DOG] = new Sprite(PATH_SPRITES + 'dog_1.png', [
	[222, 300, 0, 0], // front
	[222, 300, 0, 1], // back
	[222, 300, 0, 2], // left
	[222, 300, 0, 3], // right
], RGB_255)
SPR[SPR_ID.MOB_FROG] = new Sprite(PATH_SPRITES + 'frog_1.png', [
	[250, 300, 0, 0],
	[240, 300, 0, 1], // back
	[250, 300, 0, 3], // left
	[250, 300, 0, 2], // right
], RGB_255)

// #endregion

export default SPR
