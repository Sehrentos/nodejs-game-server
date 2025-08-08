import { ENTITY_TYPE } from '../../../shared/enum/Entity.js';
import * as Settings from '../Settings.js';

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
	 * @param {TSpriteFrames} [frames=[]] - The frames of the sprite.
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
			// unset listener, so the Sprite.addImageTransparency
			// will not trigger a new onload event (infinity loop)
			// changing the src will trigger onload
			this.image.onload = null
			if (this.isLoaded) return // Sprite is already loaded
			this.isLoaded = true
			if (transparencyColor != null) {
				Sprite.addImageTransparency(
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

	/**
	 * Draws the sprite image on the given canvas context at the given entity's last position.
	 * If the sprite image is not loaded, it will be loaded and the method will return without drawing.
	 * If the sprite frames are given, it will draw the sprite portion from the image.
	 * If no sprite frames are given, it will draw the full sprite image.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {import("../../../shared/models/Entity.js").TEntityProps} entity - The entity to draw the sprite for.
	 * @param {number} [frame=0] - The frame number of the sprite to draw. Default is 0.
	 * @returns {void}
	 *
	 * @example
	 * const mob = new Sprite('/assets/sprites/mob_1.png')
	 * // in render
	 * mob.draw(this.ctx, entity)
	 */
	draw(ctx, entity, frame = 0) {
		// check if the sprite image is loaded
		if (!this.isLoaded) {
			if (!this.isLoading) {
				this.isLoading = true
				this.load()
			}
			// draw something to indicate that the sprite is loading
			ctx.save()
			ctx.beginPath()
			ctx.rect(entity.lastX - (entity.w / 2), entity.lastY - (entity.h / 2), entity.w, entity.h)
			ctx.fillStyle = "green"
			ctx.fill()
			this.drawName(ctx, entity)
			ctx.restore()
			return
		}
		// draw the sprite
		ctx.save()
		if (this.frames.length === 0) {
			// draw the full sprite image
			ctx.drawImage(
				this.image,
				entity.lastX - (entity.w / 2), // dx
				entity.lastY - (entity.h / 2), // dy
				entity.w, // dw
				entity.h // dh
			)
		} else {
			// draw the sprite portion from the image
			const [frameWidth, frameHeight, row, column] = this.frames[frame]
			const dx = entity.lastX - (entity.w / 2)
			const dy = entity.lastY - (entity.h / 2)
			ctx.drawImage(
				this.image,
				column * frameWidth, // sx
				row * frameHeight, // sy
				frameWidth, // sw
				frameHeight, // sh
				dx,
				dy,
				// frameWidth, // dw
				// frameHeight // dh
				entity.w, // dw
				entity.h // dh
			);
		}
		// draw the entity name
		this.drawName(ctx, entity)
		ctx.restore()
	}

	/**
	 * Helper to draw sprite name to the canvas
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {import("../../../shared/models/Entity.js").TEntityProps} entity
	 * @param {string} color
	 * @param {boolean} showHp
	 */
	drawName(ctx, entity, color = "white", showHp = true) {
		ctx.save();
		ctx.beginPath();
		const marginTop = 4 // add some space between sprite and name
		let text = entity.name || "Unknown";
		if (showHp && entity.type != ENTITY_TYPE.NPC) {
			text += ` (${entity.hp}/${entity.hpMax})`
		}

		// calculate the x position to center the text
		let _x = entity.lastX - (text.length / 2) * (Settings.FONT_SIZE * Settings.FONT_WIDTH_RATIO)
		let _y = entity.lastY - (entity.h / 2) - marginTop
		let textWidth = ctx.measureText(text).width

		// draw black background rectangle
		ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		ctx.fillRect(_x - 2, _y - Settings.FONT_SIZE, textWidth + 4, Settings.FONT_SIZE + 4);

		ctx.fillStyle = color;
		ctx.font = `${Settings.FONT_SIZE}px ${Settings.FONT_FAMILY}`;
		ctx.fillText(text, _x, _y);
		// optional. autoshink text if it's too long
		// ctx.fillText(text, _x, _y, entity.w);
		ctx.restore();
	}

	/**
	 * Helper to convert image color to transparent e.g. purple (255,0,255)
	 * @param {HTMLImageElement} img
	 * @param {number} red
	 * @param {number} green
	 * @param {number} blue
	 */
	static addImageTransparency(img, red = 255, green = 0, blue = 255) {
		let canvas = Sprite.Canvas, ctx = Sprite.Context, i = 0, n, imgData;
		canvas.width = img.width || img.clientWidth;
		canvas.height = img.height || img.clientHeight;
		// ctx = canvas.getContext('2d', {
		//     willReadFrequently: true // chrome debugger suggested to use this
		// });
		ctx.drawImage(img, 0, 0);
		imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		// iterate over all pixels
		// in the image data and turn specific pixels to transparent
		n = imgData.data.length;
		for (; i < n; i += 4) {
			// with some tolerance
			// if(imgData.data[i] >= red  && imgData.data[i + 1] < green && imgData.data[i + 2] >= blue)
			// exact color match
			if (imgData.data[i] === red && imgData.data[i + 1] === green && imgData.data[i + 2] === blue) {
				imgData.data[i + 3] = 0; // Set alpha channel to 0 for transparency
			}
		}
		ctx.putImageData(imgData, 0, 0);
		// replace the existing source image with the new one
		img.src = canvas.toDataURL();
		// clean up
		i = n = ctx = imgData = undefined;
	}
	// Note use new OffscreenCanvas(width, height) instead?
	static Canvas = document.createElement('canvas')
	static Context = Sprite.Canvas.getContext('2d', {
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#willreadfrequently
		willReadFrequently: true // chrome debugger suggested to use this
	})
}
