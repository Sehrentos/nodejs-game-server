/**
 * A simple event emitter class for managing custom events.
 *
 * Allows subscribing(on) to events, unsubscribing(off), and emitting events with data.
 * @constructor
 */
export default class EventEmitter {
	constructor() {
		this.listeners = {};
	}

	on(eventName, callback) {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
		}
		this.listeners[eventName].push(callback);
	}

	off(eventName, callback) {
		if (this.listeners[eventName]) {
			this.listeners[eventName] = this.listeners[eventName].filter(
				(listener) => listener !== callback
			);
		}
	}

	emit(eventName, data) {
		if (this.listeners[eventName]) {
			this.listeners[eventName].forEach((listener) => {
				listener(data); // Call each listener with the data
			});
		}
	}
}
