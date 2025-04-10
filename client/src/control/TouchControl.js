import { PLAYER_TOUCH_AREA_SIZE } from "../../../shared/Constants.js"
import { WorldMap } from "../../../shared/models/WorldMap.js"
import { State } from "../State.js"

/**
 * @class TouchControl
 * @description Handles player touch controls
 */
export default class TouchControl {
    constructor(canvas, renderer) {
        /**
         * @type {HTMLCanvasElement}
         */
        this.canvas = canvas

        /**
         * @type {import("../Renderer").default}
         */
        this.renderer = renderer

        // binds the methods to the `this` context
        this._onClick = this.onClick.bind(this)
        this._onMouseMove = this.onMouseMove.bind(this)
        // TODO touch events

        // add event listeners
        this.canvas.addEventListener("click", this._onClick)
        this.canvas.addEventListener("mousemove", this._onMouseMove)
    }

    /**
     * Removes all touch control event listeners.
     */
    remove() {
        this.canvas.removeEventListener("click", this._onClick)
        this.canvas.removeEventListener("mousemove", this._onMouseMove)
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
        const { x, y } = this.getMousePosition(event)
        const stack = WorldMap.findEntitiesInRadius(State.map, x, y, PLAYER_TOUCH_AREA_SIZE)

        // TODO remove logs, when done testing
        console.log(x, y, stack)

        // send a "click" message to the server if it's open
        // server EntityControl.onClickPosition
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
        const { x, y } = this.getMousePosition(event)
        const stack = WorldMap.findEntitiesInRadius(State.map, x, y, PLAYER_TOUCH_AREA_SIZE)

        // change mouse cursor to pointer
        if (stack.length) {
            this.canvas.style.cursor = "pointer"
        } else {
            this.canvas.style.cursor = "default"
        }
    }

    //#region utilities

    /**
     * Gets the mouse position relative to the canvas element.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {{x: number, y: number}} - The mouse position relative to the element.
     */
    getMousePosition(event) {
        let rect = this.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        // V2 take the camera position into account
        x += this.renderer.camX
        y += this.renderer.camY
        return { x, y };
    }

    //#endregion utilities
}
