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
     * Draws the sprite image on the given canvas context at the given entity's last position.
     * If the sprite image is not loaded, it will be loaded and the method will return without drawing.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} map
     */
    draw(ctx, map) {
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
