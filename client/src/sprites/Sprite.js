import { addImageTransparency } from '../utils/Image.js';

/**
 * @typedef {number[][]} TSpriteFrames frameWidth, frameHeight, row, column e.g. `[[32, 32, 0, 1], [32, 32, 1, 2]]`
 * @typedef {{ r: number, g: number, b: number }} TSpriteTransparencyColor red, green, blue e.g. `{ r: 255, g: 0, b: 255 }`
 */

/**
 * @class Class representing a sprite.
 */
export default class Sprite {
	/**
	 * Constructor for the Sprite class.
	 *
	 * @param {string} src - The initial URL of the image.
	 * @param {TSpriteFrames} [frames=[]] - The frames of the sprite. eg. `[[frameWidth, frameHeight, row, column]]`
	 * @param {TSpriteTransparencyColor} [transparencyColor] - The transparent color of the sprite.
	 *
	 * @example
	 * const mob = new Sprite('/assets/sprites/mob_1.png')
	 * // with frames
	 * const player = new Sprite('/assets/sprites/player_1.png', [
	 *   [32, 32, 0, 0], // frameWidth, frameHeight, row, column
	 *   [32, 32, 0, 1],
	 * ])
	 * // with transparency color
	 * const npc = new Sprite('/assets/sprites/npc_1.png', [], { r: 255, g: 0, b: 255 })
	 */
	constructor(src, frames = [], transparencyColor) {
		/** @type {string} */
		this.src = src

		/** @type {TSpriteFrames} */
		this.frames = frames

		/** @type {TSpriteTransparencyColor} */
		this.transparencyColor = transparencyColor

		/** @type {boolean} */
		this.isLoading = false

		/** @type {boolean} */
		this.isLoaded = false

		/** @type {HTMLImageElement} */
		this.image = new Image()

		this.image.onload = this.onImageLoad.bind(this)

		this.image.onerror = this.onImageError.bind(this)

		// this will trigger the onload event
		// Note: we don't want to load the image immediately,
		// because we only load when needed or when sprite is used
		//this.image.src = src // Sprite.blankImageDataURL
	}

	/**
	 * Load the sprite image from the given src, or use the initial src if no argument is given.
	 * @param {string} [src] - The URL of the image. If not given, the initial src will be used.
	 *
	 * @description
	 * This method is used to load the sprite image from the given URL.
	 * If no argument is given, the initial src set in the constructor will be used.
	 *
	 * @example
	 * const mob = new Sprite('/assets/sprites/mob_1.png')
	 * // override the initial src
	 * mob.load('/assets/sprites/mob_2.png')
	 * // or use the initial src
	 * mob.load()
	 */
	load(src) {
		// override the initial src
		if (src) {
			this.src = src
		}
		this.image.src = this.src
		console.log(`[${this.constructor.name}] load: ${this.src}`) // DEBUG
	}

	/**
	 * Handles the onload event when the sprite image is loaded successfully.
	 * - Unsets the onload event listener to prevent an infinity loop.
	 * - Sets the `isLoaded` property to true.
	 * - If the sprite has a transparency color, uses `addImageTransparency` to set the transparent color of the image.
	 * @param {Event} event - The load event.
	 */
	onImageLoad(event) {
		// changing the src will trigger onload
		this.image.onload = null
		if (this.isLoaded) return // Sprite is already loaded
		this.isLoaded = true
		if (this.transparencyColor != null) {
			addImageTransparency(
				this.image,
				this.transparencyColor.r, // 255
				this.transparencyColor.g, // 0
				this.transparencyColor.b // 255
			)
		}
	}

	/**
	 * Handles the error event when the sprite image fails to load.
	 * - Sets the `isLoaded` property to false.
	 * - Logs an error message to the console.
	 *
	 * @param {Event} event - The error event.
	 */
	onImageError(event) {
		this.isLoaded = false
		console.error(`Sprite "${this.src}" failed to load the image.`)
	}
}
