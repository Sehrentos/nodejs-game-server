import { Entity } from "./Entity.js";
import { ENTITY_TYPE } from "../enum/Entity.js";
import { ELEMENT } from "../enum/Element.js";
import { Party } from "./Party.js";

/**
 * @typedef {Object} TEntityMonsterExtras
 * @prop {import("../AI.js").AI|null=} ai - AI. default null
 * @prop {number=} level - Level. default 1
 * @prop {number=} baseExp - Base experience. default 0
 * @prop {number=} jobExp - Job experience. default 0
 * @prop {number=} sex - Sex. default 0
 * @prop {number=} money - Money. default 0
 * @prop {number=} range - Melee attack range. default 2
 * @prop {number=} atk - Attack. default 1
 * @prop {number=} atkMultiplier - Attack multiplier. default 1
 * @prop {number=} mAtk - Magic attack. default 1
 * @prop {number=} mAtkMultiplier - Magic attack multiplier. default 1
 * @prop {number=} eAtk - Attack element. default ELEMENT.NEUTRAL
 * @prop {number=} eDef - Defense element. default ELEMENT.NEUTRAL
 * @prop {number=} def - Defense. default 1
 * @prop {number=} defMultiplier - Defense multiplier. default 1
 * @prop {number=} mDef - Magic defense. default 1
 * @prop {number=} mDefMultiplier - Magic defense multiplier. default 1
 * @prop {number=} dodge - Dodge. default 1
 * @prop {number=} dodgeMultiplier - Dodge multiplier. default 1
 * @prop {number=} flee - Flee. default 1
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
 * @prop {number[]=} skills - Skill list.
 * @prop {number[]=} inventory - Inventory list.
 * @prop {Party=} party - Party object. Group ID, leader ID, members ID. Monster with minions, use the Party class.
 * @prop {number=} attackStart - CONTROL: Timestamp in milliseconds when the player last attacked 
 * @prop {import("../control/EntityControl.js").TEntityControls=} attacking - CONTROL: Attacking entity
 * @prop {number=} movementStart - CONTROL: Movement start time. default 0
 * 
 * @typedef {import("./Entity.js").TEntityProps & TEntityMonsterExtras} TMonsterProps
 */

export class Monster extends Entity {
	/**
	 * Constructor for the Monster class.
	 * 
	 * @param {TMonsterProps} p - Object that contains the properties to be set.
	 */
	constructor(p) {
		super(p)

		// #region entity overrides
		this.type = ENTITY_TYPE.MONSTER
		this.w = p?.w ?? 5
		this.h = p?.h ?? 5
		this.hp = p?.hp ?? 100
		this.hpMax = p?.hpMax ?? 100
		this.mp = p?.mp ?? 50
		this.mpMax = p?.mpMax ?? 50
		// #endregion

		this.ai = p?.ai ?? null
		this.level = p?.level ?? 1
		this.baseExp = p?.baseExp ?? 0
		this.jobExp = p?.jobExp ?? 0
		this.sex = p?.sex ?? 0
		this.money = p?.money ?? 0
		this.range = p?.range ?? 2
		this.atk = p?.atk ?? 1
		this.atkMultiplier = p?.atkMultiplier ?? 1
		this.mAtk = p?.mAtk ?? 1
		this.mAtkMultiplier = p?.mAtkMultiplier ?? 1
		this.eAtk = p?.eAtk ?? ELEMENT.NEUTRAL
		this.eDef = p?.eDef ?? ELEMENT.NEUTRAL
		this.speed = p?.speed ?? 400
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
		this.flee = p?.flee ?? 1
		this.str = p?.str ?? 1
		this.agi = p?.agi ?? 1
		this.vit = p?.vit ?? 1
		this.int = p?.int ?? 1
		this.dex = p?.dex ?? 1
		this.luk = p?.luk ?? 1
		this.hit = p?.hit ?? 1
		this.hpRecovery = p?.hpRecovery ?? 0

		this.skills = p?.skills ?? []
		this.inventory = p?.inventory ?? []
		this.party = new Party(p?.party?.name, p?.party?.leader, p?.party?.members)

		// #region control
		this.attacking = p?.attacking ?? null
		this.attackStart = p?.attackStart ?? 0
		this.movementStart = p?.movementStart ?? 0
		// #endregion
	}
}