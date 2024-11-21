import { Entity } from "./Entity.js";
import { ENTITY_TYPE } from "../enum/Entity.js";

/**
 * @typedef {Object} TEntityNPCExtras
 * @prop {string=} dialog - Dialog text
 * 
 * @typedef {import("./Entity.js").TEntityProps & TEntityNPCExtras} TNPCProps
 */

export class NPC extends Entity {
    /**
     * Constructor for the Portal class.
     * 
     * @param {TNPCProps} p - Object that contains the properties to be set.
     */
    constructor(p) {
        super(p)

        // #region entity overrides
        this.type = ENTITY_TYPE.NPC
        this.w = p?.w ?? 5
        this.h = p?.h ?? 5
        // #endregion

        /** @type {string} - Dialog text */
        this.dialog = p?.dialog ?? ""
    }
}