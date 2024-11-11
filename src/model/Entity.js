import { ENTITY_TYPE } from "../enum/Entity.js"

/**
 * @typedef {Object} TEntityProps
 * @prop {number=} id - Database id.
 * @prop {string=} gid - Game id.
 * @prop {string=} name - Visual name.
 * @prop {number=} type - Entity type. default ENTITY_TYPE.NPC
 * @prop {import("../WorldMap.js").WorldMap=} map - The map this entity is in.
 * @prop {string=} mapName - Current map name.
 * @prop {number=} x - Current X position.
 * @prop {number=} y - Current Y position.
 * @prop {number=} w - The width of the entity.
 * @prop {number=} h - The height of the entity.
 * @prop {string=} saveMap - The map entity was created or saved.
 * @prop {number=} saveX - The position X entity was created or saved.
 * @prop {number=} saveY - The position Y entity was created or saved.
 * @prop {number=} dir - Direction facing 0: Down, 1: Right, 2: Up, 3: Left. default 0
 * @prop {number=} hp - Current health points.
 * @prop {number=} hpMax - Maximum health points.
 * @prop {number=} mp - Current mana points.
 * @prop {number=} mpMax - Maximum mana points.
 * @prop {boolean=} canMove - CONTROL: Whether the entity can move. default true
 * @prop {number=} quantity - CONTROL: Entity quantity in a map (when maps are loaded). default 1
 */

export class Entity {
	/**
	 * Constructor for creating a new Entity with initial properties.
	 * 
	 * This constructor initializes the entity with default values including database id, game id,
	 * entity type, visual name, map information, etc.
	 * 
	 * @param {TEntityProps} p 
	 * @type {TEntityProps}
	 */
	constructor(p) {
		this.id = p?.id ?? 0
		this.gid = p?.gid ?? ''
		this.type = p?.type ?? ENTITY_TYPE.NPC
		this.name = p?.name ?? ''
		this.map = p?.map ?? null
		this.mapName = p?.mapName ?? ''
		this.x = p?.x ?? 0
		this.y = p?.y ?? 0
		// #endregion
		this.w = p?.w ?? 1
		this.h = p?.h ?? 1
		// #region the position entity was created or saved
		this.saveMap = p?.saveMap ?? ''
		this.saveX = p?.saveX ?? 0
		this.saveY = p?.saveY ?? 0
		// #endregion
		this.dir = p?.dir ?? 0

		this.hp = p?.hp ?? 1
		this.hpMax = p?.hpMax ?? 1
		this.mp = p?.mp ?? 1
		this.mpMax = p?.mpMax ?? 1

		// #region control
		this.canMove = p?.canMove ?? true
		this.quantity = p?.quantity ?? 1
		// #endregion
	}
}