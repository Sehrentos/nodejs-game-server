import { Entity } from "./Entity.js";
import { ENTITY_TYPE } from "../enum/Entity.js";

/**
 * @typedef {Object} TPortalTo
 * @prop {number} id - Warp portal destination id.
 * @prop {string} name - Warp portal destination name.
 * @prop {number} x - Warp portal destination X position.
 * @prop {number} y - Warp portal destination Y position.
 * 
 * @typedef {Object} TEntityPortalExtras
 * @prop {TPortalTo=} portalTo - Warp portal destination.
 * 
 * @typedef {import("./Entity.js").TEntityProps & TEntityPortalExtras} TPortalProps
 */

export class Portal extends Entity {
	/**
	 * Constructor for the Portal class.
	 * 
	 * @param {TPortalProps} p - Object that contains the properties to be set.
	 */
	constructor(p) {
		super(p)

		// #region entity overrides
		this.type = ENTITY_TYPE.WARP_PORTAL
		this.w = p?.w ?? 5
		this.h = p?.h ?? 5
		// #endregion

		/** @type {TPortalTo} - Warp portal destination */
		this.portalTo = Object.assign({
			id: 0,
			name: "",
			x: 0,
			y: 0
		}, p.portalTo)
	}
}