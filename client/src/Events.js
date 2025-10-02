import EventEmitter from "../../shared/utils/EventEmitter.js";

/**
 * Global event emitter for client-side events.
 * Used for communication between different parts of the UI.
 */
const Events = new EventEmitter();

export default Events;
