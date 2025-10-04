/**
 * @constructor
 * A simple event emitter class for managing custom events.
 *
 * Allows subscribing(on) to events, unsubscribing(off), and emitting events with data.
 */
export class EventEmitter {
	constructor() {
		this.listeners = {};
	}

	/**
	 * @param {string} eventName
	 * @param {*} callback
	 */
	on(eventName, callback) {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
		}
		this.listeners[eventName].push(callback);
		return this;
	}

	/**
	 * @param {string} eventName
	 * @param {*} callback
	 */
	off(eventName, callback) {
		if (this.listeners[eventName]) {
			this.listeners[eventName] = this.listeners[eventName].filter(
				(listener) => listener !== callback
			);
		}
		return this;
	}

	/**
	 * @param {string} eventName
	 * @param {...*} data
	 */
	emit(eventName, ...data) {
		if (this.listeners[eventName]) {
			this.listeners[eventName].forEach((listener) => {
				listener(...data); // Call each listener with the data
			});
		}
		return this;
	}
}

export default EventEmitter
