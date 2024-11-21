import { State } from "./State.js"
import * as Settings from "./Settings.js"
import { DIRECTION, ENTITY_TYPE } from "../src/enum/Entity.js"

/**
 * @class Renderer
 * 
 * The Renderer class is responsible for rendering the game state to the canvas element.
 * 
 * @prop {HTMLCanvasElement} canvas - The canvas element to render to.
 * @prop {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 * @prop {number|null} frame - The current frame number, or null if the animation is stopped.
 * @prop {boolean} stop - Whether the animation is stopped.
 */
export default class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element to render to.
     * 
     * Initializes the renderer with the given canvas element.
     * 
     * @prop {HTMLCanvasElement} canvas - The canvas element to render to.
     * @prop {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
     * @prop {number|null} frame - The current frame number, or null if the animation is stopped.
     * @prop {boolean} stop - Whether the animation is stopped.
     */
    constructor(canvas) {
        /**
         * @type {HTMLCanvasElement}
         */
        this.canvas = canvas

        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = canvas.getContext("2d")

        /**
         * @type {boolean}
         */
        this.stop = false

        /**
         * @private binds the `render` method to the `this` context.
         *
         * @type {FrameRequestCallback}
         */
        this._render = this.render.bind(this)

        /**
         * @type {number|null}
         */
        this.frame = requestAnimationFrame(this._render)

        // debug
        console.log(`[DEBUG]: fpsLimit: ${Settings.FPS_LIMIT}`)
    }

    /**
     * Cancels the animation loop and releases any resources.
     */
    remove() {
        this.stop = true
        if (this.frame) {
            cancelAnimationFrame(this.frame)
        }
    }

    /**
     * Animation loop with FPS limiting.
     * 
     * @param {DOMHighResTimeStamp} timestamp - The current timestamp in milliseconds
     * @type {FrameRequestCallback}
     */
    render(timestamp) {
        if (this.stop) return;

        if (this._lastFrameTimestamp === undefined) {
            // Initialize timestamp on first loop
            this._lastFrameTimestamp = timestamp
        }

        // calculate time elapsed since last frame
        const elapsed = timestamp - this._lastFrameTimestamp

        // Calculate target interval based on FPS limit
        const targetInterval = 1000 / Settings.FPS_LIMIT;  // ms

        // Skip frame if not enough time has passed
        if (elapsed < targetInterval) {
            this.frame = requestAnimationFrame(this._render)
            return;
        }

        // Update timestamp and perform animations
        this._lastFrameTimestamp = timestamp

        // #region drawing
        if (State.map != null && State.player != null) {
            this.drawCamera(State.player)
            this.drawMapLayout(State.map)
            this.drawMapEntities(State.map, State.player)
        }
        // #endregion

        // start animation loop
        this.frame = requestAnimationFrame(this._render)
    }

    /**
     * Draws the camera view to the world bounds.
     * 
     * @param {import("../src/model/Player").TPlayerProps} player - The player entity.
     */
    drawCamera(player) {
        const cvs = this.canvas
        const ctx = this.ctx

        // World boundaries
        // this.minX = -cvs.width
        // this.maxX = cvs.width
        // this.minY = -cvs.height
        // this.maxY = cvs.height
        // option 2
        this.minX = player.x - cvs.width / 2
        this.maxX = player.x + cvs.width / 2
        this.minY = player.y - cvs.height / 2
        this.maxY = player.y + cvs.height / 2

        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, cvs.width, cvs.height)

        // center the camera around the player,
        // but clamp the edges of the camera view to the world bounds.
        this.camX = Renderer.clamp(player.x - cvs.width / 2, this.minX, this.maxX - cvs.width);
        this.camY = Renderer.clamp(player.y - cvs.height / 2, this.minY, this.maxY - cvs.height);

        ctx.translate(-this.camX, -this.camY);

        // Next step: Draw everything else normally, using x and y's.
        // If you want to take the camera position into account, use this:
        // x += this.camX
        // y += this.camY
    }

    /**
     * Draws the map layout on the canvas.
     * 
     * @param {import("./entities/WMap.js").WMapProps} map - The map to draw, including its dimensions.
     */
    drawMapLayout(map) {
        Renderer.drawRect(this.ctx, "#6F9D62", 0, 0, map.width, map.height);
    }

    /**
     * Draws all entities on the map.
     * 
     * @param {import("./entities/WMap.js").WMapProps} map - The map to draw.
     * @param {import("../src/model/Player").TPlayerProps} player - The player entity.
     */
    drawMapEntities(map, player) {
        if (map.entities.length == 0) return;

        for (const entity of map.entities) {
            if (entity.type === ENTITY_TYPE.NPC) {
                this.drawEntityNPC(entity);
            }
            else if (entity.type === ENTITY_TYPE.MONSTER) {
                this.drawEntityMonster(entity);
            }
            else if (entity.type === ENTITY_TYPE.WARP_PORTAL) {
                this.drawEntityPortal(entity);
            }
            else if (entity.type === ENTITY_TYPE.PLAYER) {
                this.drawEntityPlayer(entity, player);
            }
        }
    }


    /**
     * Draws an NPC entity on the canvas.
     * @param {import("../src/model/NPC.js").TNPCProps} entity - The NPC entity to draw.
     */
    drawEntityNPC(entity) {
        Renderer.drawCircle(this.ctx, "black", entity.x, entity.y, entity.h / 2);
        Renderer.drawEntityFacingDirection(this.ctx, entity, 4, "white");
        Renderer.drawEntityName(this.ctx, entity, "white", false);
    }

    /**
     * Draws a warp portal entity on the canvas.
     * @param {import("../src/model/Portal.js").TPortalProps} entity - The warp portal entity to draw.
     */
    drawEntityPortal(entity) {
        // Portal range is 4, check PortalControl
        const range = 4
        Renderer.drawCircle(this.ctx, "#0000ff91", entity.x, entity.y, range);
        Renderer.drawCircle(this.ctx, "blue", entity.x, entity.y, entity.h / 2);
    }

    /**
     * Draws a monster entity on the canvas.
     * @param {import("../src/model/Monster.js").TMonsterProps} entity - The monster entity to draw.
     */
    drawEntityMonster(entity) {
        Renderer.drawCircle(this.ctx, "red", entity.x, entity.y, entity.h / 2);
        Renderer.drawEntityFacingDirection(this.ctx, entity, 4, "black");
        Renderer.drawEntityName(this.ctx, entity, "red", true);
    }

    /**
     * Draws a player entity on the canvas.
     * @param {import("../src/model/Player.js").TPlayerProps} entity - The player entity to draw.
     * @param {import("../src/model/Player.js").TPlayerProps} player - The player entity from state.
     */
    drawEntityPlayer(entity, player) {
        // indentify the current player from entities by gid
        if (entity.gid === player.gid) {
            // draw current player's melee attack radius
            Renderer.drawCircle(this.ctx, "#2d2d2d57", entity.x - ((player.range / 2) - player.w), entity.y - ((player.range / 2) - player.h), player.range);
            Renderer.drawEntityFacingDirection(this.ctx, entity, player.range, "black");
        }
        Renderer.drawCircle(this.ctx, "black", entity.x, entity.y, entity.h / 2);
        Renderer.drawEntityName(this.ctx, entity, "white", true);
    }


    // #region utilities

    // clamp(10, 20, 30) - output: 20
    // clamp(40, 20, 30) - output: 30
    // clamp(25, 20, 30) - output: 25
    static clamp(value, min, max) {
        if (value < min) return min;
        else if (value > max) return max;
        return value;
    }

    /**
     * Fills a rectangle on the canvas with a specified width and height,
     * starting from the given x and y coordinates.
     * The rectangle is filled with the current fill style color.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {string} fill - The fill color of the rectangle. default: "black"
     * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
     * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     */
    static fillRect(ctx, fill, x, y, width, height) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = fill || "black";
        ctx.fillRect(x, y, width, height);
        ctx.restore();
    }

    /**
     * Draws a rectangle on the canvas with the given dimensions and
     * position. The rectangle is filled with the current fill style color,
     * or red if no fill color is provided.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {string} fill - The fill color of the rectangle. default: "red"
     * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
     * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     */
    static drawRect(ctx, fill, x, y, width, height) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = fill || "red";
        ctx.fill();
        ctx.restore();
    }

    /**
     * Draws a circle on the canvas with the given radius and position.
     * The circle is filled with the current fill style color,
     * or red if no fill color is provided.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {string} fill - The fill color of the circle. default: "red"
     * @param {number} x - The x-coordinate of the center of the circle.
     * @param {number} y - The y-coordinate of the center of the circle.
     * @param {number} radius - The radius of the circle.
     */
    static drawCircle(ctx, fill, x, y, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = fill || "red";
        ctx.fill();
        ctx.restore();
    }

    /**
     * Draws the name of the entity on the canvas at the given position.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {import("../src/model/Entity").TEntityProps} entity - The entity to draw the name for.
     * @param {string} color - The color to draw the name. default: "white"
     * @param {boolean} showHp - Whether to show the entity's health. Default false.
     */
    static drawEntityName(ctx, entity, color = "white", showHp = false) {
        ctx.save();
        ctx.beginPath();
        let text = entity.name || "Unknown";
        if (showHp) {
            text += ` (${entity.hp}/${entity.hpMax})`
        }
        // calculate the x position to center the text
        let _x = entity.x - (text.length / 2) * (Settings.FONT_SIZE * Settings.FONT_WIDTH_RATIO)
        let _y = entity.y - (entity.h || 1)
        ctx.fillStyle = color;
        ctx.font = `${Settings.FONT_SIZE}px ${Settings.FONT_FAMILY}`;
        ctx.fillText(text, _x, _y);
        ctx.restore();
    }

    /**
     * Draws the facing direction of the given entity as a line from the entity's position.
     * The line is drawn from the entity's position to the position the entity is facing.
     * The direction is determined by the entity's dir property, which is one of the DIRECTION constants.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {import("../src/model/Player").TPlayerProps} entity - The entity to draw the facing direction for.
     * @param {number} range - The range of the line. Default 2.
     * @param {string} color - The color of the line. default: "white"
     */
    static drawEntityFacingDirection(ctx, entity, range = 2, color = "white") {
        let x = entity.x
        let y = entity.y
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        switch (entity.dir) {
            case DIRECTION.UP:
                ctx.lineTo(x, y - range);
                break;
            case DIRECTION.DOWN:
                ctx.lineTo(x, y + range);
                break;
            case DIRECTION.LEFT:
                ctx.lineTo(x - range, y);
                break;
            case DIRECTION.RIGHT:
                ctx.lineTo(x + range, y);
                break;
            default: break;
        }
        ctx.stroke();
        ctx.restore();
    }

    //#endregion utilities
}