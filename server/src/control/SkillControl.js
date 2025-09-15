import { SKILL_ID, SKILL_STATE } from "../../../shared/enum/Skill.js";
import { Entity } from "../../../shared/models/Entity.js";
import { sendSkillUse } from "../events/sendSkillUse.js";
import Cooldown from "../utils/Cooldown.js";

/** Ack - no target gid is known or required, for skill use */
const NO_GID = "";

/**
 * Skill control
 */
export default class SkillControl {
	/** @param {import("../../../shared/models/Entity.js").Entity} entity */
	constructor(entity) {
		/** @type {import("../../../shared/models/Entity.js").Entity} */
		this.entity = entity;

		// /** @type {import("./EntityControl.js").EntityControl} */
		// this.control = entity.control;

		// #region cooldowns
		this._skillHealCd = new Cooldown()
		this._skillAttackCd = new Cooldown()
		// #endregion
	}

	/**
	 * Skill heal this entity by 20% HP, 10s cooldown
	 * @param {number} timestamp
	 */
	heal(timestamp) {
		const target = this.entity
		const socket = target.control.socket

		// target must be alive and not full hp
		if (target.hp <= 0 && target.hp >= target.hpMax) {
			socket.send(sendSkillUse(SKILL_ID.HEAL, target.gid, NO_GID, SKILL_STATE.IS_DEAD))
			return
		}
		if (this._skillHealCd.isNotExpired(timestamp)) {
			socket.send(sendSkillUse(SKILL_ID.HEAL, target.gid, NO_GID, SKILL_STATE.COOLDOWN))
			return
		}
		// set cooldown
		this._skillHealCd.set(timestamp + 10000 - target.latency)
		target.control.heal(target.hpMax * 0.2)

		// send ACK (acknowledge) skill use success
		socket.send(sendSkillUse(SKILL_ID.HEAL, target.gid, NO_GID, SKILL_STATE.OK))
	}

	/**
	 * Skill this entity attack with 2x more damage as normal, 5s cooldown
	 * @param {number} timestamp
	 */
	strike(timestamp) {
		const attacker = this.entity
		const socket = attacker.control.socket
		const attacking = attacker.control._attacking

		if (attacking == null) {
			socket.send(sendSkillUse(SKILL_ID.STRIKE, attacker.gid, NO_GID, SKILL_STATE.NO_TARGET))
			return
		}
		if (attacker.hp <= 0 || attacking.hp <= 0) {
			socket.send(sendSkillUse(SKILL_ID.STRIKE, attacker.gid, attacking.gid, SKILL_STATE.IS_DEAD))
			return
		}
		if (this._skillAttackCd.isNotExpired(timestamp)) {
			socket.send(sendSkillUse(SKILL_ID.STRIKE, attacker.gid, attacking.gid, SKILL_STATE.COOLDOWN))
			return
		}
		if (!Entity.inRangeOfEntity(attacker, attacking)) {
			socket.send(sendSkillUse(SKILL_ID.STRIKE, attacker.gid, attacking.gid, SKILL_STATE.OUT_OF_RANGE))
			return
		}
		// set cooldown
		this._skillAttackCd.set(timestamp + 5000 - attacker.latency)
		attacking.control.takeDamageFrom(attacker, 2.0)

		// send ACK (acknowledge) skill use success
		socket.send(sendSkillUse(SKILL_ID.STRIKE, attacker.gid, attacking.gid, SKILL_STATE.OK))
	}
}
