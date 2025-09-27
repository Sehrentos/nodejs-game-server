/**
 * @callback UnsubscribeFunction
 * @returns {void}
 */

/**
 * @template T The type of the value held by the Observable.
 * @typedef {(newValue?: T, oldValue?: T, observer?: ObserverCallback<T>, thisArg?: Observable<T>) => void} ObserverCallback
 */

/**
 * @class
 * An observable value that can be updated and observed.
 *
 * @template T
 */
export default class Observable {
	/**
	 * Create an Observable instance with the given initial value.
	 * @param {T} initValue - initial value of the observable.
	 * @param {ObserverCallback<T>[]} initObservers - optional. initial observers
	 */
	constructor(initValue, ...initObservers) {
		/**
		 * The current value of the Observable. Can be used to get current value.
		 * Or set new value to the Observable without notifying observers.
		 * @type {T}
		 */
		this.value = initValue;

		/**
		 * The list of observers.
		 * @type {ObserverCallback<T>[]}
		 */
		this.observers = [...initObservers];
	}

	/**
	 * Add an observer to the list of observers.
	 * @param {ObserverCallback<T>} observer The function to be called when the observable's value changes.
	 * @param {boolean} [runAfterSet=false] optional. If true, the observer will be called with the current value as argument.
	 * @returns {UnsubscribeFunction} A function to unsubscribe the observer from the list of observers.
	 */
	subscribe(observer, runAfterSet = false) {
		this.observers.push(observer);
		if (runAfterSet) observer(this.value, this.value, observer, this);
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
	 * Set the new value to the Observable and notify all observers.
	 * If the argument is a function, it's called with the current value as argument.
	 * If the argument is not a function, the value is simply updated to the given value.
	 *
	 * @param {((newValue: T) => T) | T} [updater] The value or a function to update the value with.
	 */
	set(updater) {
		let oldValue = this.value;
		if (typeof updater === 'function') {
			// @ts-ignore function type is checked
			this.value = updater(this.value);
		} else {
			this.value = updater;
		}
		this.observers.forEach((observer) => observer(this.value, oldValue, observer, this));
	}
}
