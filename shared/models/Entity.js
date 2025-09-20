import { DIRECTION, ENTITY_TYPE } from "../enum/Entity.js"
import { ELEMENT } from "../enum/Element.js";
import * as Const from "../Constants.js";
import { Item } from "./Item.js";

/**
 * @typedef {Object} TEntityProps
 * @prop {bigint|number|string=} id - Database ID. Note: use type `string` if `bigint` (MariaDB int(11) auto_increment)
 * @prop {string=} gid - Game ID.
 * @prop {bigint|number|string=} aid - Account ID. Note: use type `string` if `bigint` (MariaDB int(11) auto_increment)
 * @prop {string=} name - Visual name.
 * @prop {number=} type - Entity type. default ENTITY_TYPE.NPC
 * @prop {string=} lastMap - Current map name.
 * @prop {number=} lastX - Current X position.
 * @prop {number=} lastY - Current Y position.
 * @prop {number=} w - The width of the entity. default: 64
 * @prop {number=} h - The height of the entity. default: 64
 * @prop {boolean=} visible - Whether the entity is visible. default: true
 * @prop {string=} saveMap - The map entity was created or saved.
 * @prop {number=} saveX - The position X entity was created or saved.
 * @prop {number=} saveY - The position Y entity was created or saved.
 * @prop {number=} dir - Direction facing 0: Left (x--), 1: Right (x++), 2: Up (y--), 3: Down (y++). default 0
 * @prop {number=} hp - Current health points.
 * @prop {number=} hpMax - Maximum health points.
 * @prop {number=} mp - Current mana points.
 * @prop {number=} mpMax - Maximum mana points.
 * @prop {DOMHighResTimeStamp=} death - Time of death. default 0
 * @prop {number=} latency - **Player** Latency. default 0
 * @prop {number=} level - Level. default 1
 * @prop {number=} jobLevel - Job level. default 1
 * @prop {number=} baseExp - Base experience. default 0
 * @prop {number=} jobExp - Job experience. default 0
 * @prop {number=} job - Job / class. default 0
 * @prop {number=} sex - Sex. default 0
 * @prop {Date=} lastLogin - Last login date.
 * @prop {number=} money - Money. default 0
 * @prop {number=} eAtk - Attack element. default ELEMENT.NEUTRAL
 * @prop {number=} eDef - Defense element. default ELEMENT.NEUTRAL
 * @prop {number=} range - Melee attack range.
 * @prop {number=} atk - Attack. default 1
 * @prop {number=} atkMultiplier - Attack multiplier. default 1.0
 * @prop {number=} mAtk - Magic attack. default 1
 * @prop {number=} mAtkMultiplier - Magic attack multiplier. default 1.0
 * @prop {number=} aspd - Attack speed. default 1000
 * @prop {number=} aspdMultiplier - Attack speed multiplier. default 1.0
 * @prop {number=} cspd - Cast speed. default 1000
 * @prop {number=} cspdMultiplier - Cast speed multiplier. default 1.0
 * @prop {number=} crit - Critical. default 0
 * @prop {number=} critMultiplier - Critical multiplier. default 1.0
 * @prop {number=} def - Defense. default 0
 * @prop {number=} defMultiplier - Defense multiplier. default 1.0
 * @prop {number=} mDef - Magic defense. default 0
 * @prop {number=} mDefMultiplier - Magic defense multiplier. default 1.0
 * @prop {number=} dodge - Dodge. default 0
 * @prop {number=} dodgeMultiplier - Dodge multiplier. default 1.0
 * @prop {number=} block - Block change. default 0
 * @prop {number=} blockMultiplier - Block change multiplier. default 1.0
 * @prop {number=} str - Strength. default 1
 * @prop {number=} dex - Dexterity. default 1
 * @prop {number=} vit - Vitality. default 1
 * @prop {number=} int - Intelligence. default 1
 * @prop {number=} agi - Agility. default 1
 * @prop {number=} luk - Luck. default 1
 * @prop {number=} hit - Hit change / accuracy. default 1
 * @prop {number=} speed - Movement speed.
 * @prop {number=} hpRecovery - Health recovery amount. default 0
 * @prop {number=} hpRecoveryRate - Health recovery rate.
 * @prop {number=} mpRecovery - Mana recovery amount. default 0
 * @prop {number=} mpRecoveryRate - Mana recovery rate.
 * @prop {number[]=} skills - Skill list.
 * @prop {import("./Item.js").TItemProps[]=} equipment - Equipment list.
 * @prop {import("./Item.js").TItemProps[]=} inventory - Inventory list.
 * @prop {number[]=} quests - Quest list.
 * @prop {number=} partyId - Party ID. default 0
 * @prop {string=} portalName - **Portal** destination map name.
 * @prop {number=} portalX - **Portal** destination X position.
 * @prop {number=} portalY - **Portal** destination Y position.
 * @prop {string=} dialog - **NPC** dialog text
 * @prop {Entity=} owner - **PET** Owner entity
 * @prop {number[]=} pets - **Player** Pet entity IDs.
 * @prop {import("../../server/src/control/EntityControl.js").EntityControl=} control - **CONTROL** controller instance
 */

export class Entity {
	/**
	 * Constructor for creating a new Entity with initial properties.
	 *
	 * This constructor initializes the entity with default values including database id, game id,
	 * entity type, visual name, map information, etc.
	 *
	 * @param {TEntityProps} p
	 */
	constructor(p) {
		/** @type {bigint|number|string=} Database ID. Note: use type `string` if `bigint` (JSON serialization) */
		this.id = p?.id ?? 0
		/** @type {string} Game ID */
		this.gid = p?.gid ?? ''
		/** @type {bigint|number|string=} AccountID. Note: use type `string` if `bigint` (JSON serialization) */
		this.aid = p?.aid ?? 0
		this.type = p?.type ?? ENTITY_TYPE.NPC
		this.name = p?.name ?? ''

		/** @type {boolean} Whether the entity is visible. default: true */
		this.visible = p?.visible ?? true

		// #region size
		this.w = p?.w ?? Const.ENTITY_WIDTH
		this.h = p?.h ?? Const.ENTITY_HEIGHT
		// #endregion

		// #region positions current & saved
		this.dir = p?.dir ?? DIRECTION.DOWN
		this.lastMap = p?.lastMap ?? Const.ENTITY_LAST_MAP
		this.lastX = p?.lastX ?? Const.ENTITY_LAST_X
		this.lastY = p?.lastY ?? Const.ENTITY_LAST_Y
		this.saveMap = p?.saveMap ?? Const.ENTITY_LAST_MAP
		this.saveX = p?.saveX ?? Const.ENTITY_LAST_X
		this.saveY = p?.saveY ?? Const.ENTITY_LAST_Y
		// #endregion

		// #region health & mana
		this.hp = p?.hp ?? 1
		this.hpMax = p?.hpMax ?? 1
		this.mp = p?.mp ?? 1
		this.mpMax = p?.mpMax ?? 1
		// #endregion

		/** @type {DOMHighResTimeStamp} - time of death. default 0 */
		this.death = p?.death ?? 0
		this.latency = p?.latency ?? 0

		this.level = p?.level ?? 1
		this.jobLevel = p?.jobLevel ?? 1
		this.baseExp = p?.baseExp ?? 0
		this.jobExp = p?.jobExp ?? 0
		this.job = p?.job ?? 0
		this.sex = p?.sex ?? 0
		this.lastLogin = p?.lastLogin ?? new Date()
		this.money = p?.money ?? 0
		this.eAtk = p?.eAtk ?? ELEMENT.NEUTRAL
		this.eDef = p?.eDef ?? ELEMENT.NEUTRAL
		this.range = p?.range ?? Const.ENTITY_RANGE
		this.atk = p?.atk ?? 1
		this.atkMultiplier = p?.atkMultiplier ?? 1.0
		this.mAtk = p?.mAtk ?? 1
		this.mAtkMultiplier = p?.mAtkMultiplier ?? 1.0
		this.speed = p?.speed ?? Const.ENTITY_MOVE_SPEED
		this.aspd = p?.aspd ?? Const.ENTITY_ATK_SPEED
		this.aspdMultiplier = p?.aspdMultiplier ?? 1.0
		this.cspd = p?.cspd ?? Const.ENTITY_CAST_SPEED
		this.cspdMultiplier = p?.cspdMultiplier ?? 1.0
		this.crit = p?.crit ?? 0
		this.critMultiplier = p?.critMultiplier ?? 1.0
		this.def = p?.def ?? 0
		this.defMultiplier = p?.defMultiplier ?? 1.0
		this.mDef = p?.mDef ?? 0
		this.mDefMultiplier = p?.mDefMultiplier ?? 1.0
		this.dodge = p?.dodge ?? 0
		this.dodgeMultiplier = p?.dodgeMultiplier ?? 1.0
		this.block = p?.block ?? 0
		this.blockMultiplier = p?.blockMultiplier ?? 1.0
		this.str = p?.str ?? 1
		this.agi = p?.agi ?? 1
		this.vit = p?.vit ?? 1
		this.int = p?.int ?? 1
		this.dex = p?.dex ?? 1
		this.luk = p?.luk ?? 1
		this.hit = p?.hit ?? 1

		// #region Recovery
		/** @type {number} - Health recovery amount. default 0 */
		this.hpRecovery = p?.hpRecovery ?? 0
		/** @type {number} - Health recovery rate */
		this.hpRecoveryRate = p?.hpRecoveryRate ?? Const.ENTITY_HP_REGEN_RATE
		/** @type {number} - Mana recovery amount. default 0 */
		this.mpRecovery = p?.mpRecovery ?? 0
		/** @type {number} - Mana recovery rate */
		this.mpRecoveryRate = p?.mpRecoveryRate ?? Const.ENTITY_MP_REGEN_RATE
		// #endregion

		this.skills = p?.skills ?? []
		this.equipment = (p?.equipment ?? []).map(i => new Item(i))
		this.inventory = (p?.inventory ?? []).map(i => new Item(i))
		this.quests = p?.quests ?? []
		this.partyId = p?.partyId ?? 0
		// TODO - move Party to world instance and just set partyId here
		// this.party = new Party(p?.party?.name, p?.party?.leader, p?.party?.members)

		// #region NPC
		/** @type {string} - **NPC** dialog text */
		this.dialog = p?.dialog ?? ''
		// #endregion

		// #region PORTAL
		/** @type {string} - Warp portal destination map name */
		this.portalName = p?.portalName ?? ''
		/** @type {number} - Warp portal destination X */
		this.portalX = p?.portalX ?? 0
		/** @type {number} - Warp portal destination Y */
		this.portalY = p?.portalY ?? 0
		// #endregion

		// #region PET
		/** @type {Entity} - Owner entity */
		this.owner = p?.owner ?? null
		/** @type {number[]} - **Player** Pet entity IDs. */
		this.pets = p?.pets ?? []
		// #endregion

		// #region control
		/** @type {import("../../server/src/control/EntityControl.js").EntityControl} */
		this.control = p?.control ?? null
		// #endregion
	}

	/**
	 * Checks if the given coordinates (x, y) are within the range of the given entity.
	 * The range is defined as the absolute difference between the entity's position and the given coordinates.
	 * @param {Entity} entity - The first entity
	 * @param {number} x - The x coordinate
	 * @param {number} y - The y coordinate
	 * @param {number} range - The range
	 * @returns {boolean} True if the coordinates are within the range of the entity, otherwise false.
	 */
	static inRangeOf(entity, x, y, range) {
		return Math.abs(entity.lastX - x) <= range && Math.abs(entity.lastY - y) <= range
	}

	/**
	 * Checks if the entities are within the range of each other.
	 * @param {Entity} entity1 - The first entity
	 * @param {Entity} entity2 - The second entity
	 * @returns {boolean} True if the coordinates are within the range of the first entity, otherwise false.
	 */
	static inRangeOfEntity(entity1, entity2) {
		return Math.abs(entity1.lastX - entity2.lastX) <= entity1.range && Math.abs(entity1.lastY - entity2.lastY) <= entity1.range
	}
}
