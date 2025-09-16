/**
 * @callback UnsubscribeFunction
 * @returns {void}
 */

/**
 * Callback function invoked when an observable's value changes.
 * @typedef {(newValue: T, oldValue: T, observer: ObserverCallback<T>) => void} ObserverCallback
 * @template T The type of the Observable's value for this specific callback instance.
 */

/**
 * An observable value that can be updated and observed.
 * @template T The type of the value held by the Observable.
 */
export default class Observable {
	/**
	 * Create an Observable instance with the given initial value.
	 * @param {T} value Initial value of the observable.
	 */
	constructor(value) {
		/** @type {T} */
		this._value = value;
		/** @type {Array<ObserverCallback<T>>} */
		this.observers = [];
	}

	/**
	 * Add an observer to the list of observers.
	 * @param {ObserverCallback<T>} observer The function to be called when the observable's value changes.
	 * @returns {UnsubscribeFunction} A function to unsubscribe the observer from the list of observers.
	 * @example
	 * const observable = new Observable(0);
	 * const observer = (newValue, oldValue) => console.log("Observable value changed from", oldValue, "to", newValue);
	 * // subscribes the observer and returns an unsubscribe function
	 * const unsubscribe = observable.subscribe(observer);
	 * unsubscribe(); // unsubscribes the observer
	 * @example
	 * const observable = new Observable(0);
	 * const unsubscribe = observable.subscribe(function observerCallback(newValue, oldValue, observer) {
	 * 	console.log("Observable value changed from", oldValue, "to", newValue);
	 *  // unsubscribe from the observable:
	 *  unsubscribe();
	 *  observable.unsubscribe(observer); // or this
	 *  observable.unsubscribe(observerCallback); // or this
	 * })
	 */
	subscribe(observer) {
		this.observers.push(observer);
		return () => this.unsubscribe(observer);
	}

	/**
	 * Remove an observer from the list of observers.
	 * @param {ObserverCallback<T>} observer The function to be removed.
	 * @returns {void}
	 */
	unsubscribe(observer) {
		this.observers = this.observers.filter((obs) => obs !== observer);
	}

	/**
	 * Remove all observers from the list of observers.
	 * @returns {void}
	 */
	unsubscribeAll() {
		this.observers = [];
	}

	/**
	 * Set the new value of the Observable and notify all observers.
	 * If the argument is a function, it's called with the current value as argument.
	 * If the argument is not a function, the value is simply updated to the given value.
	 * Any registered observers are called with the new and old value after the update.
	 * @param {((value: T) => T) | T} [updater] The value or a function to update the value with.
	 */
	set(updater) {
		let oldValue = this._value;
		if (typeof updater === 'function') {
			// @ts-ignore function type is checked
			this._value = updater(this._value);
		} else {
			this._value = updater;
		}
		this.observers.forEach((observer) => observer(this._value, oldValue, observer));
	}

	/**
	 * The current value of the Observable.
	 * @type {T}
	 */
	get value() {
		return this._value;
	}

	/**
	 * Sets the value of the Observable without notifying observers.
	 * @param {T} value The new value to set.
	 * @returns {void}
	 */
	set value(value) {
		this._value = value;
	}
}
