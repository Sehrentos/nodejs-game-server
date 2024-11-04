/**
 * @typedef {import("../../src/model/Entity.js").EntityProps} EntityProps
 * 
 * @typedef {Object} WMapProps
 * @prop {number=} id - Database id.
 * @prop {string=} name - Visual name.
 * @prop {number=} width - The width of the map.
 * @prop {number=} height - The height of the map.
 * @prop {Array<EntityProps>=} entities - A list of entities.
 */
/**
 * @module WMap
 * @desc Represents a world map, with entities in it.
 * @type {WMapProps}
 */
export default class WMap {
	constructor(p) {
		/** @type {number} */
		this.id = p?.id ?? 0
		/** @type {string} */
		this.name = p?.name ?? ""
		/** @type {number} */
		this.width = p?.width ?? 0
		/** @type {number} */
		this.height = p?.height ?? 0
		/** @type {Array<EntityProps>} */
		this.entities = p?.entities ?? []
	}
}