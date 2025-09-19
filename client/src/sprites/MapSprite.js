import Sprite from './Sprite.js';

/**
 * @typedef {number[][]} TSpriteFrames frameWidth, frameHeight, row, column e.g. `[[32, 32, 0, 1], [32, 32, 1, 2]]`
 * @typedef {{ r: number, g: number, b: number }} TSpriteTransparencyColor red, green, blue e.g. `{ r: 255, g: 0, b: 255 }`
 */

/**
 * @example
 * const map = new MapSprite('/assets/maps/map_1.jpg')
 * // in render
 * map.draw(this.ctx, worldmapData)
 */
export default class MapSprite extends Sprite {
	constructor(src, transparencyColor) {
		super(src, [], transparencyColor)
	}

	/**
	 * @override
	 * Draws the map sprite on the canvas.
	 * If the sprite image is not loaded, it will be loaded and a placeholder will be drawn instead.
	 *
	 * @param {...any} args - The arguments can be either: CanvasRenderingContext2D, WorldMap
	 *
	 * @example map.draw(this.ctx, worldmapData)
	 */
	draw(...args) {
		const [
			/** @type {CanvasRenderingContext2D} */ctx,
			/** @type {import("../../../shared/models/WorldMap.js").WorldMap} */map
		] = args;
		// check if the sprite image is loaded
		if (!this.isLoaded) {
			if (!this.isLoading) {
				this.isLoading = true
				this.load()
			}
			// draw something to indicate that the sprite is loading
			ctx.save()
			ctx.beginPath()
			ctx.rect(0, 0, map.width, map.height)
			ctx.fillStyle = "#6F9D62"
			ctx.fill()
			ctx.restore()
			return
		}
		// draw the sprite
		ctx.save()
		ctx.drawImage(
			this.image,
			0, // dx
			0, // dy
			map.width, // dw
			map.height // dh
		)
		ctx.restore()
	}
}
