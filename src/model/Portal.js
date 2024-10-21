import { Entity } from "./Entity.js";
import { ENTITY_TYPE } from "../enum/Entity.js";

/**
 * @typedef {Object} EntityExtras
 * @prop {number=} type - Entity type. default ENTITY_TYPE.WARP_PORTAL
 * @prop {{id:number, name:string, x:number, y:number}=} portalTo - Warp portal destination.
 * @typedef {import("./Entity.js").EntityProps & EntityExtras} PortalProps
 */

export class Portal extends Entity {
	/**
	 * Constructor for the Portal class.
	 * 
	 * @param {PortalProps} p - Object that contains the properties to be set.
	 */
	constructor(p) {
		super(p)
		// monster specific props
		this.type = p?.type ?? ENTITY_TYPE.WARP_PORTAL
		this.portalTo = p?.portalTo ?? {
			id: 0,
			name: "",
			x: 0,
			y: 0
		}
	}
}