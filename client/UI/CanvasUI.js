import m from "mithril"
import "./CanvasUI.css"
import { State } from "../State.js"
import { DIRECTION, ENTITY_TYPE } from "../../src/enum/Entity.js"
import * as Settings from "../Settings.js"

/**
 * @class CanvasUI
 * @description Draw the game on the canvas.
 * @exports CanvasUI
 */
export default class CanvasUI {
	/**
	 * @param {m.Vnode} vnode 
	 */
	constructor(vnode) {
		this.id = "game-canvas"
		/** @type {HTMLCanvasElement|null} */
		this.canvas = null
		/** @type {number|null} */
		this.frame = null
		this.stop = false

		// events
		this._render = this.render.bind(this)
		this._onResize = this.onResize.bind(this)
		this._onClick = this.onClick.bind(this)
		this._onMouseMove = this.onMouseMove.bind(this)
	}

	// #region mithril events
	oncreate(vnode) {
		this.canvas = vnode.dom
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight

		// events
		window.addEventListener("resize", this._onResize)
		this.canvas.addEventListener("click", this._onClick)
		this.canvas.addEventListener("mousemove", this._onMouseMove)

		this.frame = requestAnimationFrame(this._render)
		console.log(`[DEBUG]: fpsLimit: ${Settings.FPS_LIMIT}`)
	}
	onremove() {
		this.stop = true
		if (this.frame) {
			cancelAnimationFrame(this.frame)
		}
		window.removeEventListener("resize", this._onResize)
		this.canvas.removeEventListener("click", this._onClick)
		this.canvas.removeEventListener("mousemove", this._onMouseMove)
	}
	view(vnode) {
		return m("canvas.ui-canvas", { id: this.id })
	}
	// #endregion mithril events

	/**
	 * Animation loop with FPS limiting
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

		const cvs = this.canvas
		const ctx = cvs.getContext("2d")

		//#region V1
		// always draw background
		// CanvasUI.drawRect(ctx, "#000000", 0, 0, cvs.width, cvs.height);
		// draw map boundaries from server
		// if (State.map != null) {
		// 	CanvasUI.drawRect(ctx, "#6F9D62", 0, 0, State.map.width, State.map.height);
		// }
		// draw entities
		// this.drawEntities(ctx)
		//#endregion

		// #region V2 with camera
		if (State.map != null && State.player != null) {
			this.drawCameraAndMap(ctx)
			this.drawEntities(ctx)
		}
		// #endregion

		// start animation loop
		this.frame = requestAnimationFrame(this._render)
	}

	/**
	 * Draws the map.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @description
	 * Draws the map with the player at the center.
	 * Clamps the camera view to the world bounds.
	 * Draws the map layout.
	 */
	drawCameraAndMap(ctx) {
		const cvs = this.canvas
		const _map = State.map
		const _player = State.player

		// World boundaries
		// this.minX = -cvs.width
		// this.maxX = cvs.width
		// this.minY = -cvs.height
		// this.maxY = cvs.height
		// option 2
		this.minX = _player.x - cvs.width / 2
		this.maxX = _player.x + cvs.width / 2
		this.minY = _player.y - cvs.height / 2
		this.maxY = _player.y + cvs.height / 2

		ctx.setTransform(1, 0, 0, 1, 0, 0)
		ctx.clearRect(0, 0, cvs.width, cvs.height)

		// center the camera around the player,
		// but clamp the edges of the camera view to the world bounds.
		this.camX = this.clamp(_player.x - cvs.width / 2, this.minX, this.maxX - cvs.width);
		this.camY = this.clamp(_player.y - cvs.height / 2, this.minY, this.maxY - cvs.height);

		ctx.translate(-this.camX, -this.camY);

		// Next step: Draw everything else normally, using x and y's.
		// If you want to take the camera position into account, use this:
		// x += this.camX
		// y += this.camY

		// draw the map layout
		CanvasUI.drawRect(ctx, "#6F9D62", 0, 0, _map.width, _map.height);
	}

	// clamp(10, 20, 30) - output: 20
	// clamp(40, 20, 30) - output: 30
	// clamp(25, 20, 30) - output: 25
	clamp(value, min, max) {
		if (value < min) return min;
		else if (value > max) return max;
		return value;
	}

	/**
	 * Draws all entities on the map.
	 * 
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 */
	drawEntities(ctx) {
		if (State.map.entities.length == 0) return;

		for (const entity of State.map.entities) {
			let x = entity.x
			let y = entity.y
			let w = entity.w
			let h = entity.h
			let _radius = h / 2 // 2.5
			if (entity.type === ENTITY_TYPE.NPC) {
				// CanvasUI.drawRect(ctx, "brown", x, y, w, h);
				CanvasUI.drawCircle(ctx, "black", x, y, _radius);
				CanvasUI.drawEntityFacingDirection(ctx, entity, 4, "white");
				CanvasUI.drawEntityName(ctx, entity, "white", false);
			}
			else if (entity.type === ENTITY_TYPE.MONSTER) {
				CanvasUI.drawCircle(ctx, "red", x, y, _radius);
				CanvasUI.drawEntityFacingDirection(ctx, entity, 4, "black");
				CanvasUI.drawEntityName(ctx, entity, "red", true);
			}
			else if (entity.type === ENTITY_TYPE.WARP_PORTAL) {
				CanvasUI.drawCircle(ctx, "blue", x, y, _radius);
			}
			else if (entity.type === ENTITY_TYPE.PLAYER) {
				let player = State.player
				// indentify the current player from entities by gid
				if (entity.gid === player.gid) {
					// draw player's melee attack radius
					CanvasUI.drawCircle(ctx, "#2d2d2d57", x - ((player.range / 2) - player.w), y - ((player.range / 2) - player.h), player.range);
					CanvasUI.drawEntityFacingDirection(ctx, entity, player.range, "black");
				}
				CanvasUI.drawCircle(ctx, "black", x, y, _radius);
				CanvasUI.drawEntityName(ctx, entity, "white", true);
			}
		}
	}

	/**
	 * Resizes the canvas to the window size.
	 */
	onResize() {
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
	}

	/**
	 * Handles the click event on the canvas.
	 * 
	 * @param {MouseEvent} event - The mouse event.
	 */
	onClick(event) {
		event.preventDefault()
		event.stopPropagation()

		if (this.canvas == null || State.map == null || State.socket == null) return
		const { x, y } = this.getMousePosition(this.canvas, event)
		const stack = CanvasUI.findEntitiesInRadius(State.map, x, y, 4)

		// TODO remove logs, when done testing
		console.log(x, y, stack)

		// send a "click" message to the server
		State.socket.send(JSON.stringify({ type: "click", x, y }))
	}

	/**
	 * Handles the mouse move event on the canvas.
	 * 
	 * Updates the mouse cursor style based on the presence of entities
	 * within a 4-cell radius at the current mouse position. If entities
	 * are found, the cursor changes to a pointer, otherwise it defaults
	 * to the standard cursor.
	 * 
	 * @param {MouseEvent} event - The mouse move event.
	 */
	onMouseMove(event) {
		if (this.canvas == null || State.map == null) return
		const { x, y } = this.getMousePosition(this.canvas, event)
		const stack = CanvasUI.findEntitiesInRadius(State.map, x, y, 4)

		// change mouse cursor to pointer
		if (stack.length) {
			this.canvas.style.cursor = "pointer"
		} else {
			this.canvas.style.cursor = "default"
		}
	}

	//#region utilities

	/**
	 * Gets the mouse position relative to the given element.
	 * 
	 * @param {HTMLElement} element - The element to get the mouse position from.
	 * @param {MouseEvent} event - The mouse event.
	 * @returns {{x: number, y: number}} - The mouse position relative to the element.
	 */
	getMousePosition(element, event) {
		let rect = element.getBoundingClientRect();
		let x = event.clientX - rect.left;
		let y = event.clientY - rect.top;
		// V2 take the camera position into account
		x += this.camX
		y += this.camY
		return { x, y };
	}

	/**
	 * Finds entities in the given radius around a specific point.
	 * 
	 * @param {import("../entities/WMap.js").WMapProps} map - The map to search.
	 * @param {number} x - The x-coordinate of the center point.
	 * @param {number} y - The y-coordinate of the center point.
	 * @param {number} radius - The radius to search for entities.
	 * @returns {Array} - An array of entities within the specified radius.
	 */
	static findEntitiesInRadius(map, x, y, radius) {
		const stack = [] // entities can be on top of each other
		if (map == null) return stack
		const entities = map.entities
		let _x, _y
		for (const entity of entities) {
			_x = entity.x
			_y = entity.y
			// if (Math.abs(x - _x) > radius || Math.abs(y - _y) > radius) continue
			if ((Math.abs((x - (radius / 2)) - _x) > radius || Math.abs((y - (radius / 2)) - _y) > radius) &&
				(Math.abs(x - _x) > radius || Math.abs(y - _y) > radius)) {
				continue;
			}
			stack.push(entity)
		}
		return stack
	}

	/**
	 * Fills a rectangle on the canvas with a specified width and height,
	 * starting from the given x and y coordinates.
	 * The rectangle is filled with the current fill style color.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
	 * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 */
	static fillRect(ctx, x, y, width, height) {
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.fillRect(x, y, width, height);
		ctx.stroke();
	}

	/**
	 * Draws a rectangle on the canvas with the given dimensions and
	 * position. The rectangle is filled with the current fill style color,
	 * or red if no fill color is provided.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {string} fill - The fill color of the rectangle.
	 * @param {number} x - The x-coordinate of the top-left corner of the rectangle.
	 * @param {number} y - The y-coordinate of the top-left corner of the rectangle.
	 * @param {number} width - The width of the rectangle.
	 * @param {number} height - The height of the rectangle.
	 */
	static drawRect(ctx, fill, x, y, width, height) {
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.fillStyle = fill || "red";
		ctx.fill();
		ctx.stroke();
	}

	/**
	 * Draws a circle on the canvas with the given radius and position.
	 * The circle is filled with the current fill style color,
	 * or red if no fill color is provided.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {string} fill - The fill color of the circle.
	 * @param {number} x - The x-coordinate of the center of the circle.
	 * @param {number} y - The y-coordinate of the center of the circle.
	 * @param {number} radius - The radius of the circle.
	 */
	static drawCircle(ctx, fill, x, y, radius) {
		ctx.beginPath();
		ctx.fillStyle = fill || "red";
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	}

	/**
	 * Draws the name of the entity on the canvas at the given position.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {import("../../src/model/Entity").TEntityProps} entity - The entity to draw the name for.
	 * @param {string} color - The color to draw the name. Default white.
	 * @param {boolean} showHp - Whether to show the entity's health. Default false.
	 */
	static drawEntityName(ctx, entity, color = "white", showHp = false) {
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
		ctx.stroke();
	}

	/**
	 * Draws the facing direction of the given entity as a line from the entity's position.
	 * The line is drawn from the entity's position to the position the entity is facing.
	 * The direction is determined by the entity's dir property, which is one of the DIRECTION constants.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {import("../../src/model/Player").TPlayerProps} entity - The entity to draw the facing direction for.
	 * @param {number} range - The range of the line. Default 2.
	 * @param {string} color - The color of the line. Default white.
	 */
	static drawEntityFacingDirection(ctx, entity, range = 2, color = "white") {
		let x = entity.x
		let y = entity.y
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
		ctx.strokeStyle = "black"; // reset stroke color to default
	}

	//#endregion utilities
}