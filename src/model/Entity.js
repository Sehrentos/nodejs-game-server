import { ELEMENT } from "../enum/Element.js"
import { ENTITY_TYPE } from "../enum/Entity.js"

/**
 * @typedef {import("../WorldMap.js").WorldMap} WorldMap
 * @typedef {Object} EntityProps
 * @prop {number=} id - Database id.
 * @prop {string=} gid - Game id.
 * @prop {import("../AI.js").AI=} ai - AI object. default null
 * @prop {string=} name - Visual name.
 * @prop {number=} type - Entity type. default ENTITY_TYPE.NPC
 * @prop {WorldMap=} map - The map this entity is in.
 * @prop {number=} hp - Current health points.
 * @prop {number=} hpMax - Maximum health points.
 * @prop {number=} mp - Current mana points.
 * @prop {number=} mpMax - Maximum mana points.
 * @prop {number=} x - Current X position.
 * @prop {number=} y - Current Y position.
 * @prop {number=} saveX - The position X entity was created or saved.
 * @prop {number=} saveY - The position Y entity was created or saved.
 * @prop {number=} dir - Direction facing 0: Down, 1: Right, 2: Up, 3: Left. default 0
 * @prop {number=} level - Level. default 1
 * @prop {number=} jobLevel - Job level. default 0
 * @prop {number=} baseExp - Base experience. default 0
 * @prop {number=} jobExp - Job experience. default 0
 * @prop {number=} money - Money. default 0
 * @prop {number=} atk - Attack. default 1
 * @prop {number=} atkMultiplier - Attack multiplier. default 1
 * @prop {number=} mAtk - Magic attack. default 1
 * @prop {number=} mAtkMultiplier - Magic attack multiplier. default 1
 * @prop {number=} elementAtk - Attack element. default ELEMENT.NEUTRAL
 * @prop {number=} elementDef - Defense element. default ELEMENT.NEUTRAL
 * @prop {number=} def - Defense. default 1
 * @prop {number=} defMultiplier - Defense multiplier. default 1
 * @prop {number=} mDef - Magic defense. default 1
 * @prop {number=} mDefMultiplier - Magic defense multiplier. default 1
 * @prop {number=} dodge - Dodge. default 1
 * @prop {number=} dodgeMultiplier - Dodge multiplier. default 1
 * @prop {number=} str - Strength. default 1
 * @prop {number=} dex - Dexterity. default 1
 * @prop {number=} vit - Vitality. default 1
 * @prop {number=} int - Intelligence. default 1
 * @prop {number=} agi - Agility. default 1
 * @prop {number=} luk - Luck. default 1
 * @prop {number=} hit - Hit change / accuracy. default 1
 * @prop {number=} speed - Speed. default 400
 * @prop {number=} speedMultiplier - Speed multiplier. default 1
 * @prop {number=} aspd - Attack speed. default 1
 * @prop {number=} aspdMultiplier - Attack speed multiplier. default 1
 * @prop {number=} cspd - Cast speed. default 1
 * @prop {number=} cspdMultiplier - Cast speed multiplier. default 1
 * @prop {number=} crit - Critical. default 1
 * @prop {number=} critMultiplier - Critical multiplier. default 1
 * @prop {number=} hpRecovery - Health recovery. default 0
 * @prop {number=} mpRecovery - Mana recovery. default 0
 * @prop {number=} job - Job. default 0
 * @prop {number=} sex - Sex. default 0
 * @prop {number[]=} equipment - Equipment list. default 0
 * @prop {number[]=} skills - Skill list. default 0
 * @prop {number=} movementStart - Movement start time. default 0
 * @prop {{id:number, name:string, x:number, y:number}=} portalTo - Warp portal destination.
 */

export class Entity {
	/**
	 * Constructor for creating a new Entity with initial properties.
	 * 
	 * This constructor initializes the entity with default values including database id, game id,
	 * entity type, visual name, map information, etc.
	 * 
	 * @param {EntityProps} p 
	 */
	constructor(p = {}) {
		/** database id */
		this.id = p?.id ?? 0
		/** game id to identify this entity */
		this.gid = p?.gid ?? ''
		this.ai = p?.ai ?? null
		/** entity type NPC, PLAYER, MONSTER. default ENTITY_TYPE.NPC */
		this.type = p?.type ?? ENTITY_TYPE.NPC
		/** visual name */
		this.name = p?.name ?? ''
		/** @type {null|WorldMap} - The map this entity is in */
		this.map = p?.map ?? null
		this.hp = p?.hp ?? 1
		this.hpMax = p?.hpMax ?? 1
		this.mp = p?.mp ?? 1
		this.mpMax = p?.mpMax ?? 1
		/** current X position */
		this.x = p?.x ?? 0
		/** current Y position */
		this.y = p?.y ?? 0
		/** the position entity was created or saved (Player) */
		this.saveX = p?.saveX ?? 0
		this.saveY = p?.saveY ?? 0
		/** @type {number} - Direction facing 0: Down, 1: Right, 2: Up, 3: Left */
		this.dir = p?.dir ?? 0
		this.level = p?.level ?? 1
		this.jobLevel = p?.jobLevel ?? 1
		this.baseExp = p?.baseExp ?? 0
		this.jobExp = p?.jobExp ?? 0
		this.money = p?.money ?? 0
		this.atk = p?.atk ?? 1
		this.atkMultiplier = p?.atkMultiplier ?? 1
		/** Attack Element. default ELEMENT.NEUTRAL */
		this.elementAtk = p?.elementAtk ?? ELEMENT.NEUTRAL
		this.mAtk = p?.mAtk ?? 1
		this.mAtkMultiplier = p?.mAtkMultiplier ?? 1
		this.speed = p?.speed ?? 100
		this.speedMultiplier = p?.speedMultiplier ?? 1
		this.aspd = p?.aspd ?? 1
		this.aspdMultiplier = p?.aspdMultiplier ?? 1
		this.cspd = p?.cspd ?? 1
		this.cspdMultiplier = p?.cspdMultiplier ?? 1
		this.crit = p?.crit ?? 1
		this.critMultiplier = p?.critMultiplier ?? 1
		this.def = p?.def ?? 1
		this.defMultiplier = p?.defMultiplier ?? 1
		this.mDef = p?.mDef ?? 1
		this.mDefMultiplier = p?.mDefMultiplier ?? 1
		this.dodge = p?.dodge ?? 1
		this.dodgeMultiplier = p?.dodgeMultiplier ?? 1
		this.str = p?.str ?? 1
		this.agi = p?.agi ?? 1
		this.vit = p?.vit ?? 1
		this.int = p?.int ?? 1
		this.dex = p?.dex ?? 1
		this.luk = p?.luk ?? 1
		this.hit = p?.hit ?? 1
		this.hpRecovery = p?.hpRecovery ?? 0
		this.mpRecovery = p?.mpRecovery ?? 0
		this.job = p?.job ?? 0
		this.sex = p?.sex ?? 0
		/** Defense Element. default ELEMENT.NEUTRAL */
		this.elementDef = p?.elementDef ?? ELEMENT.NEUTRAL
		this.equipment = p?.equipment ?? []
		this.skills = p?.skills ?? []
		/** start time of movement in ms */
		this.movementStart = p?.movementStart ?? 0
		this.portalTo = p?.portalTo ?? null
	}
}