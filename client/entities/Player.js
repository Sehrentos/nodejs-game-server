import { Player as PlayerModel } from "../../src/model/Player.js"
import KeyControl from "../control/KeyControl.js"

export default class Player extends PlayerModel {
	/**
	 * @param {import("../../src/model/Player").PlayerProps} player 
	 */
	constructor(player) {
		super(player)
		this.keyControl = new KeyControl(this)
	}
	onCreate() {
		this.keyControl.bind()
	}
	onRemove() {
		this.keyControl.unbind()
	}

	/**
	 * Server sent player update
	 * @param {import("../../src/Packets.js").TPlayer} data
	 */
	update(data) {
		// merge the server data to the current player state
		// TODO merge needs to be deep?
		Object.assign(this, data) // naive approach
	}

}