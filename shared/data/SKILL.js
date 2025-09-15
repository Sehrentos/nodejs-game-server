import { SKILL_ID, SKILL_STATE } from "../enum/Skill.js";

/**
 * Skill details and messages
 */
export const SKILL = {
	[SKILL_ID.NONE]: {
		name: "Unkown",
		desc: "Unkown skill.",
	},
	[SKILL_ID.HEAL]: {
		name: "Heal",
		desc: "Heal 20% HP, 10s cooldown.",
	},
	[SKILL_ID.STRIKE]: {
		name: "Strike",
		desc: "Attack 2x more damage as normal, 5s cooldown.",
	},
}

/**
 * Skill use state messages
 */
export const STATE = {
	[SKILL_STATE.OK]: "OK",
	[SKILL_STATE.NONE]: "None",
	[SKILL_STATE.COOLDOWN]: "Cooldown",
	[SKILL_STATE.IS_DEAD]: "Dead",
	[SKILL_STATE.OUT_OF_RANGE]: "Out of range",
	[SKILL_STATE.NO_TARGET]: "No target",
}
