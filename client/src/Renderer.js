import * as Settings from "./Settings.js"
import * as Const from "../../shared/Constants.js";
import { DIRECTION, ENTITY_TYPE } from "../../shared/enum/Entity.js"
import SPRITES from "./sprites/Sprites.js"
import { getNPCById } from "../../shared/data/NPCS.js"
import { getMobById } from "../../shared/data/MOBS.js";
import { Entity } from "../../shared/models/Entity.js";

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
	 * Initializes the renderer with the given canvas element.
	 *
	 * @param {import("./State.js").State} state
	 *
	 * @prop {HTMLCanvasElement} canvas - The canvas element to render to.
	 * @prop {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
	 * @prop {number|null} frame - The current frame number, or null if the animation is stopped.
	 * @prop {boolean} stop - Whether the animation is stopped.
	 */
	constructor(state) {
		/** @type {import("./State.js").State} */
		this.state = state

		/**
		 * @type {HTMLCanvasElement}
		 */
		this.canvas = state.canvas

		/**
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx = this.canvas.getContext("2d")

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
		if (this.state.map.value != null && this.state.player.value != null) {
			// client-side predictions
			this.state.playerControl?.onTick(timestamp)
			// normal rendering
			this.drawCamera(this.state.player.value)
			if (this.state.map.value != null) {
				this.drawMapLayout(this.state.map.value)
				this.drawMapEntities(this.state.map.value)
			}
		}
		// #endregion

		// start animation loop
		this.frame = requestAnimationFrame(this._render)
	}

	/**
	 * Draws the camera view to the world bounds.
	 *
	 * @param {import("../../shared/models/Entity.js").Entity} player - The player entity.
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
		this.minX = player.lastX - cvs.width / 2
		this.maxX = player.lastX + cvs.width / 2
		this.minY = player.lastY - cvs.height / 2
		this.maxY = player.lastY + cvs.height / 2

		ctx.setTransform(1, 0, 0, 1, 0, 0)
		ctx.clearRect(0, 0, cvs.width, cvs.height)

		// center the camera around the player,
		// but clamp the edges of the camera view to the world bounds.
		this.camX = Renderer.clamp(player.lastX - cvs.width / 2, this.minX, this.maxX - cvs.width);
		this.camY = Renderer.clamp(player.lastY - cvs.height / 2, this.minY, this.maxY - cvs.height);

		ctx.translate(-this.camX, -this.camY);

		// Next step: Draw everything else normally, using x and y's.
		// If you want to take the camera position into account, use this:
		// x += this.camX
		// y += this.camY
	}

	/**
	 * Draws the map layout on the canvas.
	 *
	 * @param {import("../../shared/models/WorldMap.js").WorldMap} map - The map to draw, including its dimensions.
	 */
	drawMapLayout(map) {
		// draw map by sprite
		const spriteId = map.spriteId || map.id
		const sprite = SPRITES[spriteId]
		if (sprite) {
			Renderer.drawMapSprite(sprite, this.ctx, map)
		} else {
			Renderer.drawRect(this.ctx, "#6F9D62", 0, 0, map.width, map.height);
		}
	}

	/**
	 * Draws all entities on the map.
	 *
	 * @param {import("../../shared/models/WorldMap.js").TWorldMapProps} map - The map to draw.
	 */
	drawMapEntities(map) {
		if (map.entities.length == 0) return;

		for (const entity of map.entities) {
			if (entity.type === ENTITY_TYPE.NPC) {
				this.drawEntityNPC(entity);
			}
			else if (entity.type === ENTITY_TYPE.MONSTER) {
				this.drawEntityMonster(entity);
			}
			else if (entity.type === ENTITY_TYPE.PORTAL) {
				this.drawEntityPortal(entity);
			}
			else if (entity.type === ENTITY_TYPE.PLAYER) {
				this.drawEntityPlayer(entity);
			}
			else if (entity.type === ENTITY_TYPE.PET) {
				this.drawEntityMonster(entity);
			} else {
				// unknown entity type
				Renderer.drawCircle(this.ctx, "purple", entity.lastX, entity.lastY, Const.ENTITY_HEIGHT / 2);
				Renderer.drawEntityFacingDirection(this.ctx, entity, 4, "white");
				Renderer.drawEntityName(this.ctx, entity, "purple", false);
				console.warn(`[WARN]: Unknown entity type: ${entity.type}`, entity);
			}
		}
	}

	/**
	 * Draws an NPC entity on the canvas.
	 * @param {import("../../shared/models/Entity.js").TEntityProps} entity - The NPC entity to draw.
	 */
	drawEntityNPC(entity) {
		const spriteId = entity.spriteId || entity.id
		const sprite = SPRITES[spriteId]
		const npc = getNPCById(entity.id)
		if (sprite && npc) {
			const npcData = new Entity({ ...npc, ...entity }) // merge entity data (status, etc)
			Renderer.drawEntitySprite(sprite, this.ctx, npcData, 0);
		} else {
			Renderer.drawCircle(this.ctx, "black", entity.lastX, entity.lastY, Const.ENTITY_HEIGHT / 2);
			Renderer.drawEntityFacingDirection(this.ctx, entity, 4, "white");
			Renderer.drawEntityName(this.ctx, entity, "white", false);
		}
	}

	/**
	 * Draws a warp portal entity on the canvas.
	 * @param {import("../../shared/models/Entity.js").TEntityProps} entity - The warp portal entity to draw.
	 */
	drawEntityPortal(entity) {
		// Portal range
		// TODO portal default entity data (server side)
		Renderer.drawCircle(this.ctx, "#0000ff91", entity.lastX, entity.lastY, entity.range);
		Renderer.drawCircle(this.ctx, "blue", entity.lastX, entity.lastY, entity.h / 2);
	}

	/**
	 * Draws a monster entity on the canvas.
	 * @param {import("../../shared/models/Entity.js").TEntityProps} entity - The monster entity to draw.
	 */
	drawEntityMonster(entity) {
		// dont draw, when entity is dead
		if (entity.hp <= 0) return;
		// draw entity by sprite, if available. fallback to id
		const spriteId = entity.spriteId || entity.id
		const sprite = SPRITES[spriteId]
		const mob = getMobById(entity.id)
		if (sprite && mob) {
			const mobData = new Entity({ ...mob, ...entity }) // merge entity data (hp, status, etc)
			// Renderer.drawEntitySprite(sprite, this.ctx, entity, entity.dir === 2 ? 1 : 0)
			// 0: Left (x--), 1: Right (x++), 2: Up (y--), 3: Down (y++). default 0
			switch (entity.dir) {
				case 0: Renderer.drawEntitySprite(sprite, this.ctx, mobData, 2); break; // left
				case 1: Renderer.drawEntitySprite(sprite, this.ctx, mobData, 3); break; // right
				case 2: Renderer.drawEntitySprite(sprite, this.ctx, mobData, 1); break; // back
				default: Renderer.drawEntitySprite(sprite, this.ctx, mobData, 0); break; // front
			}
		} else {
			Renderer.drawCircle(this.ctx, "red", entity.lastX, entity.lastY, Const.ENTITY_HEIGHT / 2);
			Renderer.drawEntityFacingDirection(this.ctx, entity, entity.range, "black");
			Renderer.drawEntityName(this.ctx, entity, "red", true);
		}
	}

	/**
	 * Draws a player entity on the canvas.
	 * @param {import("../../shared/models/Entity.js").Entity} entity - The player entity to draw.
	 */
	drawEntityPlayer(entity) {
		// draw player by sprite, if available. fallback to id 1
		const spriteId = entity.spriteId || 1
		const sprite = SPRITES[spriteId]
		const baseEntity = new Entity(entity) // create a base entity to get default values
		if (sprite) {
			// 0: Left (x--), 1: Right (x++), 2: Up (y--), 3: Down (y++). default 0
			switch (entity.dir) {
				case 0: Renderer.drawEntitySprite(sprite, this.ctx, baseEntity, 2); break; // left
				case 1: Renderer.drawEntitySprite(sprite, this.ctx, baseEntity, 3); break; // right
				case 2: Renderer.drawEntitySprite(sprite, this.ctx, baseEntity, 1); break; // back
				default: Renderer.drawEntitySprite(sprite, this.ctx, baseEntity, 0); break; // front
			}
			// Renderer.drawEntitySprite(sprite, this.ctx, entity, entity.dir === 2 ? 1 : 0)
		} else {
			// fallback
			// draw current player's melee attack radius
			Renderer.drawCircle(this.ctx, "#2d2d2d57", entity.lastX - ((entity.range / 2) - entity.w), entity.lastY - ((entity.range / 2) - Const.ENTITY_HEIGHT), entity.range);
			Renderer.drawEntityFacingDirection(this.ctx, entity, entity.range, "black");
			Renderer.drawCircle(this.ctx, "black", entity.lastX, entity.lastY, Const.ENTITY_HEIGHT / 2);
			Renderer.drawEntityName(this.ctx, entity, "white", true);
		}
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
	 * Draws the map sprite on the canvas.
	 * If the sprite image is not loaded, it will be loaded and a placeholder will be drawn instead.
	 *
	 * @param {import("./sprites/Sprite").default} sprite
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {import("../../shared/models/WorldMap.js").WorldMap} map
	 * @returns
	 */
	static drawMapSprite(sprite, ctx, map) {
		// check if the sprite image is loaded
		if (!sprite.isLoaded) {
			if (!sprite.isLoading) {
				sprite.isLoading = true
				sprite.load()
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
			sprite.image,
			0, // dx
			0, // dy
			map.width, // dw
			map.height // dh
		)
		ctx.restore()
	}

	/**
	 * Draws the sprite image on the given canvas context at the given entity's last position.
	 * If the sprite image is not loaded, it will be loaded and the method will return without drawing.
	 * If the sprite frames are given, it will draw the sprite portion from the image.
	 * If no sprite frames are given, it will draw the full sprite image.
	 *
	 * @param {import("./sprites/Sprite").default} sprite - The sprite to draw.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {import("../../shared/models/Entity.js").TEntityProps} entity - The entity to use.
	 * @param {number} [frame] - The frame number to draw. Default is 0.
	 *
	 * @returns {void}
	 */
	static drawEntitySprite(sprite, ctx, entity, frame) {
		// default frame to 0
		let frameIndex = (typeof frame === 'number' && frame >= 0) ? frame : 0

		// sanity check for frame index
		if (sprite.frames.length > 0 && frameIndex >= sprite.frames.length) {
			// fallback to useing the last frame
			frameIndex = sprite.frames.length - 1
			// or just return
			// return console.warn(`[${sprite.constructor.name}] draw: frame index ${frameIndex} is out of bounds, max is ${sprite.frames.length - 1}`)
		}

		// check if the sprite image is loaded
		if (!sprite.isLoaded) {
			if (!sprite.isLoading) {
				sprite.isLoading = true
				sprite.load()
			}
			// draw something to indicate that the sprite is loading
			ctx.save()
			ctx.beginPath()
			ctx.rect(entity.lastX - (entity.w / 2), entity.lastY - (Const.ENTITY_HEIGHT / 2), entity.w, Const.ENTITY_HEIGHT)
			ctx.fillStyle = "green"
			ctx.fill()
			Renderer.drawEntityName(ctx, entity, "white", true);
			ctx.restore()
			return
		}
		// draw the sprite
		ctx.save()
		if (sprite.frames.length === 0) {
			// draw the full sprite image
			ctx.drawImage(
				sprite.image,
				entity.lastX - (entity.w / 2), // dx
				entity.lastY - (Const.ENTITY_HEIGHT / 2), // dy
				entity.w, // dw
				Const.ENTITY_HEIGHT // dh
			)
		} else {
			// draw the sprite portion from the image
			const [frameWidth, frameHeight, row, column] = sprite.frames[frameIndex]
			const dx = entity.lastX - (entity.w / 2)
			const dy = entity.lastY - (Const.ENTITY_HEIGHT / 2)
			ctx.drawImage(
				sprite.image,
				column * frameWidth, // sx
				row * frameHeight, // sy
				frameWidth, // sw
				frameHeight, // sh
				dx,
				dy,
				// frameWidth, // dw
				// frameHeight // dh
				entity.w, // dw
				Const.ENTITY_HEIGHT // dh
			);
		}
		// draw the entity name
		Renderer.drawEntityName(ctx, entity, "white", true);
		ctx.restore()
	}

	/**
	 * Draws the name of the entity on the canvas at the given position.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {import("../../shared/models/Entity.js").TEntityProps} entity - The entity to draw the name for.
	 * @param {string} color - The color to draw the name. default: "white"
	 * @param {boolean} showHp - Whether to show the entity's health. Default true.
	 */
	static drawEntityName(ctx, entity, color = "white", showHp = true) {
		// ctx.save();
		// ctx.beginPath();
		// let text = entity.name || "Unknown";
		// if (showHp) {
		// 	text += ` (${entity.hp}/${entity.hpMax})`
		// }
		// // calculate the x position to center the text
		// let _x = entity.lastX - (text.length / 2) * (Settings.FONT_SIZE * Settings.FONT_WIDTH_RATIO)
		// let _y = entity.lastY - (Const.ENTITY_HEIGHT || 1)
		// ctx.fillStyle = color;
		// ctx.font = `${Settings.FONT_SIZE}px ${Settings.FONT_FAMILY}`;
		// ctx.fillText(text, _x, _y);
		// ctx.restore();

		ctx.save();
		ctx.beginPath();
		const marginTop = 4 // add some space between sprite and name
		let text = entity.name || "Unknown";
		if (showHp && entity.type != ENTITY_TYPE.NPC) {
			text += ` (${entity.hp}/${entity.hpMax})`
		}

		// calculate the x position to center the text
		let _x = entity.lastX - (text.length / 2) * (Settings.FONT_SIZE * Settings.FONT_WIDTH_RATIO)
		let _y = entity.lastY - (Const.ENTITY_HEIGHT / 2) - marginTop
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
	 * Draws the facing direction of the given entity as a line from the entity's position.
	 * The line is drawn from the entity's position to the position the entity is facing.
	 * The direction is determined by the entity's dir property, which is one of the DIRECTION constants.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {import("../../shared/models/Entity.js").TEntityProps} entity - The entity to draw the facing direction for.
	 * @param {number} range - The range of the line. Default 2.
	 * @param {string} color - The color of the line. default: "white"
	 */
	static drawEntityFacingDirection(ctx, entity, range = 2, color = "white") {
		let x = entity.lastX
		let y = entity.lastY
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
