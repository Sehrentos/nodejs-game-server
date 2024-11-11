import { Player as PlayerModel } from "../../src/model/Player.js"
import KeyControl from "../control/KeyControl.js"

export default class Player extends PlayerModel {
	/**
	 * @param {import("../../src/model/Player").TPlayerProps} player 
	 */
	constructor(player) {
		super(player)
		// client only properties
		this.keyControl = new KeyControl(this)
		this.keyControl.bind()
	}

	remove() {
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