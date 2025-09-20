import { addImageTransparency } from '../utils/Image.js';

/**
 * @typedef {number[][]} TSpriteFrames frameWidth, frameHeight, row, column e.g. `[[32, 32, 0, 1], [32, 32, 1, 2]]`
 * @typedef {{ r: number, g: number, b: number }} TSpriteTransparencyColor red, green, blue e.g. `{ r: 255, g: 0, b: 255 }`
 */

/**
 * @example
 * const mob = new Sprite('/assets/sprites/mob_1.png')
 * // in render
 * mob.draw(this.ctx, entity)
 */
export default class Sprite {
	/**
	 * @param {string} src - The URL of the image.
	 * @param {TSpriteFrames} [frames=[]] - The frames of the sprite. eg. `[[frameWidth, frameHeight, row, column]]`
	 * @param {TSpriteTransparencyColor} [transparencyColor] - The transparent color of the sprite.
	 * @description
	 * Constructor for the Sprite class.
	 *
	 * @example
	 * const mob = new Sprite('/assets/sprites/mob_1.png')
	 * // in render
	 * mob.draw(this.ctx, entity)
	 */
	constructor(src, frames = [], transparencyColor) {
		/** @type {string} */
		this._src = src

		/** @type {boolean} */
		this.isLoading = false

		/** @type {boolean} */
		this.isLoaded = false

		/** @type {TSpriteFrames} */
		this.frames = frames

		/** @type {HTMLImageElement} */
		this.image = new Image()

		this.image.onload = () => {
			// unset listener, so the addImageTransparency
			// will not trigger a new onload event (infinity loop)
			// changing the src will trigger onload
			this.image.onload = null
			if (this.isLoaded) return // Sprite is already loaded
			this.isLoaded = true
			if (transparencyColor != null) {
				addImageTransparency(
					this.image,
					transparencyColor.r, // 255
					transparencyColor.g, // 0
					transparencyColor.b // 255
				)
			}
		}
		this.image.onerror = (err) => { // optional
			this.isLoaded = false
			console.error(`Sprite ${src} failed to load: ${err.toString()}`)
		}
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
			this._src = src
		}
		this.image.src = this._src
		console.log(`[${this.constructor.name}] load: ${this._src}`) // DEBUG
	}
}
