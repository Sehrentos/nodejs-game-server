import { TYPE } from "../../../shared/enum/Entity.js";
import { SKILL_ID, SKILL_STATE } from "../../../shared/enum/Skill.js";
import { inRangeOfEntity } from "../../../shared/utils/EntityUtils.js";
import * as PetAction from "../actions/entity.js";
import { sendSkillUse } from "../events/sendSkillUse.js";
import Cooldown from "../../../shared/utils/Cooldown.js";
// import createGameId from "../utils/createGameId.js";
// import { AIPet } from "./AIPet.js";
// import { EntityControl } from "./EntityControl.js";

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
		this._skillTameCd = new Cooldown()
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
		if (!inRangeOfEntity(attacker, attacking)) {
			socket.send(sendSkillUse(SKILL_ID.STRIKE, attacker.gid, attacking.gid, SKILL_STATE.OUT_OF_RANGE))
			return
		}
		// set cooldown
		this._skillAttackCd.set(timestamp + 5000 - attacker.latency)
		attacking.control.takeDamageFrom(attacker, 2.0)

		// send ACK (acknowledge) skill use success
		socket.send(sendSkillUse(SKILL_ID.STRIKE, attacker.gid, attacking.gid, SKILL_STATE.OK))
	}

	/**
	 * Skill this entity attempt to tame a monster to be your pet, 30s cooldown
	 * @param {number} timestamp
	 */
	tame(timestamp) {
		const tamer = this.entity
		const socket = tamer.control.socket
		const taming = tamer.control._follow || tamer.control._attacking

		if (taming == null) {
			socket.send(sendSkillUse(SKILL_ID.TAME, tamer.gid, NO_GID, SKILL_STATE.NO_TARGET))
			return
		}
		// must be monster type
		if (taming.type !== TYPE.MONSTER) {
			socket.send(sendSkillUse(SKILL_ID.TAME, tamer.gid, taming.gid, SKILL_STATE.INVALID_TARGET))
			return
		}
		if (tamer.hp <= 0 || taming.hp <= 0) {
			socket.send(sendSkillUse(SKILL_ID.TAME, tamer.gid, taming.gid, SKILL_STATE.IS_DEAD))
			return
		}
		if (this._skillTameCd.isNotExpired(timestamp)) {
			socket.send(sendSkillUse(SKILL_ID.TAME, tamer.gid, taming.gid, SKILL_STATE.COOLDOWN))
			return
		}
		// if (!inRangeOf(tamer, taming.lastX, taming.lastY, 50)) {
		// 	socket.send(sendSkillUse(SKILL_ID.TAME, tamer.gid, taming.gid, SKILL_STATE.OUT_OF_RANGE))
		// 	return
		// }
		// set cooldown
		this._skillTameCd.set(timestamp + 30000 - tamer.latency)
		// attempt to tame
		// if (Math.random() < 0.3) { // 30% success rate
		// if (Math.random() < 0.7) { // 70% success rate

		// add the pet to the world and owned by the tamer
		const pets = PetAction.createPetEntity(tamer, taming.id)
		// optional. remove the tamed monster from the map
		// taming.control.die()
		for (const pet of pets) {
			console.log(`[TAME]: ${pet.name} (hp:${pet.hp}, x:${pet.lastX},y:${pet.lastY},map:${pet.lastMap}) owner: ${pet.owner.name}`)
		}

		// send ACK (acknowledge) skill use success
		socket.send(sendSkillUse(SKILL_ID.TAME, tamer.gid, taming.gid, SKILL_STATE.OK))
	}
}
