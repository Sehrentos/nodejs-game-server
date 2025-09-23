
/**
 * Cooldown class.
 * 
 * This class is used to track cooldowns.
 * 
 * @class Cooldown
 */
export default class Cooldown {
    /**
     * Cooldown constructor.
     * 
     * Initializes the cooldown timestamp to 0
     */
    constructor() {
        this._cd = 0
    }
    /**
     * Sets the cooldown timestamp to the given value.
     * @param {number} timestamp - The new cooldown timestamp.
     */
    set(timestamp) {
        this._cd = timestamp
    }
    /**
     * Gets the current cooldown timestamp.
     * @returns {number} The current cooldown timestamp.
     */
    get() {
        return this._cd
    }
    /**
     * Resets the cooldown timestamp to 0.
     */
    reset() {
        this._cd = 0
    }
    /**
     * Checks if the cooldown has expired at the given timestamp.
     * @param {number} timestamp - The timestamp to compare with.
     * @returns {boolean} True if the cooldown has expired, false otherwise.
     */
    isExpired(timestamp) {
        return this._cd < timestamp
    }
    /**
     * Checks if the cooldown has not expired at the given timestamp.
     * @param {number} timestamp - The timestamp to compare with.
     * @returns {boolean} True if the cooldown has not expired, false otherwise.
     */
    isNotExpired(timestamp) {
        return this._cd > timestamp
    }
    /**
     * Checks if the current cooldown timestamp is less than the given one.
     * @param {number} timestamp - The timestamp to compare with.
     * @returns {boolean} True if the cooldown timestamp is less, false otherwise.
     */
    isLess(timestamp) {
        return this._cd < timestamp
    }
    /**
     * Checks if the current cooldown timestamp is more than the given one.
     * @param {number} timestamp - The timestamp to compare with.
     * @returns {boolean} True if the cooldown timestamp is more, false otherwise.
     */
    isMore(timestamp) {
        return this._cd > timestamp
    }
    /**
     * Checks if the current cooldown timestamp is equal to the given one.
     * @param {number} timestamp - The timestamp to compare with.
     * @returns {boolean} True if the cooldown timestamp is equal, false otherwise.
     */
    isEqual(timestamp) {
        return this._cd === timestamp
    }
    /**
     * Checks if the current cooldown timestamp is not equal to the given one.
     * @param {number} timestamp - The timestamp to compare with.
     * @returns {boolean} True if the cooldown timestamp is not equal, false otherwise.
     */
    isNotEqual(timestamp) {
        return this._cd !== timestamp
    }
}