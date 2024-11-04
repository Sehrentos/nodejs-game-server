import { State } from "../State.js"

export default class KeyControl {
	constructor(entity) {
		this.entity = entity
		this._onKeydown = this.onKeydown.bind(this)
	}
	bind() {
		window.addEventListener("keydown", this._onKeydown)
	}
	unbind() {
		window.removeEventListener("keydown", this._onKeydown)
	}
	onKeydown(e) {
		if (this.entity == null || State.map == null) return
		//if (!KeyControls.KEYS.includes(event.code)) return;
		State.socket?.send(JSON.stringify({ type: "move", code: e.code }));
		switch (e.code) {
			case "KeyA":
			case "ArrowLeft":
				this.entity.dir = 0
				if (this.entity.x > 0) {
					this.entity.x--
				}
				break
			case "KeyD":
			case "ArrowRight":
				this.entity.dir = 1
				if (this.entity.x < State.map.width) {
					this.entity.x++
				}
				break
			case "KeyW":
			case "ArrowUp":
				this.entity.dir = 2
				if (this.entity.y > 0) {
					this.entity.y--
				}
				break
			case "KeyS":
			case "ArrowDown":
				this.entity.dir = 3
				if (this.entity.y < State.map.height) {
					this.entity.y++
				}
				break
			default:
				break
		}
	}
	//static const KEYS = "KeyA,KeyD,KeyW,KeyS,ArrowLeft,ArrowRight,ArrowUp,ArrowDown".split(",")
}