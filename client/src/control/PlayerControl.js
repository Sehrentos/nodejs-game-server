// import Observable from "../utils/Observable.js"

/**
 * Player controller
 */
export default class PlayerControl {
	/**
	 * @param {import("../State.js").State} state
	 */
	constructor(state) {
		/** @type {import("../State.js").State} */
		this.state = state
		/**
		 * entity move to position
		 *
		 * @type {{x: number, y: number}|null}
		 */
		this._moveTo = null
	}

	// TODO client side move predictions
}
