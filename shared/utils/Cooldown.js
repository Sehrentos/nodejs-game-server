/**
 * Cooldown class.
 *
 * This class is used to track cooldowns.
 *
 * @class Cooldown
 */
export class Cooldown {
	/**
	 * Creates a new Cooldown instance.
	 * @param {number} [initTimestamp] - The initial cooldown timestamp. Defaults to 0.
	 */
	constructor(initTimestamp = 0) {
		this._initTimestamp = initTimestamp
		this.timestamp = initTimestamp
	}
	/**
	 * Sets the cooldown timestamp to the given value.
	 * @param {number} timestamp - The new cooldown timestamp.
	 */
	set(timestamp) {
		this.timestamp = timestamp
	}
	/**
	 * Gets the current cooldown timestamp.
	 * @returns {number} The current cooldown timestamp.
	 */
	get() {
		return this.timestamp
	}
	/**
	 * Resets the cooldown timestamp to its initial value.
	 */
	reset() {
		this.timestamp = this._initTimestamp
	}
	/**
	 * Checks if the cooldown has expired at the given timestamp.
	 * @param {number} timestamp - The timestamp to compare with.
	 * @returns {boolean} True if the cooldown has expired, false otherwise.
	 */
	isExpired(timestamp) {
		return this.timestamp < timestamp
	}
	/**
	 * Checks if the cooldown has not expired at the given timestamp.
	 * @param {number} timestamp - The timestamp to compare with.
	 * @returns {boolean} True if the cooldown has not expired, false otherwise.
	 */
	isNotExpired(timestamp) {
		return this.timestamp > timestamp
	}
	/**
	 * Checks if the current cooldown timestamp is less than the given one.
	 * @param {number} timestamp - The timestamp to compare with.
	 * @returns {boolean} True if the cooldown timestamp is less, false otherwise.
	 */
	isLess(timestamp) {
		return this.timestamp < timestamp
	}
	/**
	 * Checks if the current cooldown timestamp is more than the given one.
	 * @param {number} timestamp - The timestamp to compare with.
	 * @returns {boolean} True if the cooldown timestamp is more, false otherwise.
	 */
	isMore(timestamp) {
		return this.timestamp > timestamp
	}
	/**
	 * Checks if the current cooldown timestamp is equal to the given one.
	 * @param {number} timestamp - The timestamp to compare with.
	 * @returns {boolean} True if the cooldown timestamp is equal, false otherwise.
	 */
	isEqual(timestamp) {
		return this.timestamp === timestamp
	}
	/**
	 * Checks if the current cooldown timestamp is not equal to the given one.
	 * @param {number} timestamp - The timestamp to compare with.
	 * @returns {boolean} True if the cooldown timestamp is not equal, false otherwise.
	 */
	isNotEqual(timestamp) {
		return this.timestamp !== timestamp
	}
}

export default Cooldown
