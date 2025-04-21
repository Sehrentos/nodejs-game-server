import { EXP_BASE, EXP_JOB } from "../../../shared/Constants.js"
import { ENTITY_TYPE } from "../../../shared/enum/Entity.js"
import { Item } from "../../../shared/models/Item.js"
import { getRandomInt } from "../utils/getRandomInt.js"
import { sendItemsReceived } from "./sendItemsReceived.js"

/**
 * Handles the event when an entity is killed.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} killer - The entity responsible for the kill.
 * @param {import("../../../shared/models/Entity.js").Entity} killed - The entity that was killed.
 */
export function onEntityKill(killer, killed) {
	if (killed.type === ENTITY_TYPE.NPC) return // NPC can't die
	if (killed.type === ENTITY_TYPE.PORTAL) return // PORTAL can't die
	const timestamp = performance.now()

	killed.hp = 0
	killed.mp = 0
	killed.death = timestamp

	killed.control.stopMoveTo()
	killed.control.stopFollow()
	killed.control.stopAttack()

	// send killed player to saved position
	if (killed.type === ENTITY_TYPE.PLAYER) {
		killed.control.toSavePosition()
		killed.control.revive()
	}

	// NEXT: reward the attacker, but only players can get exp
	if (killer.type !== ENTITY_TYPE.PLAYER) return

	// reward the player with exp
	killer.baseExp += killed.baseExp
	killer.jobExp += killed.jobExp

	// check if player can level up
	// const EXP_TABLE = [null, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
	// const expTable = EXP_TABLE[killer.level]
	// if (expTable != null) {
	// 	// base level up +1
	// 	if (killer.baseExp >= expTable) {
	// 		killer.level++
	// 		killer.baseExp = 0 // reset base exp
	// 		killer.control.syncStats() // update stats
	// 		killer.control.heal(killer.hpMax, killer.mpMax) // heal 100%
	// 	}
	// 	// job level up +1
	// 	if (killer.jobExp >= expTable) {
	// 		killer.jobLevel++
	// 		killer.jobExp = 0
	// 	}
	// }

	// check if killer can level up
	if (killer.baseExp >= killer.level * EXP_BASE) {
		killer.level++
		killer.baseExp = 0
		killer.control.syncStats() // update stats
		killer.control.heal(killer.hpMax, killer.mpMax) // heal 100%
	}
	if (killer.jobExp >= killer.jobLevel * EXP_JOB) {
		killer.jobLevel++
		killer.jobExp = 0
		// restore all mana as bonus
		killer.control.heal(0, killer.mpMax)
	}

	// reaward the player with items from the killed monster
	if (killed.type === ENTITY_TYPE.MONSTER) {
		const items = []
		for (const item of killed.inventory) {
			// check drop change of item and reward it when it is dropped
			if (item.dropChange > 0 && getRandomInt(0, 100) <= item.dropChange) { // 0 - 100%
				// create new item object and set player id
				let _item = new Item(item)
				_item.playerId = typeof killer.id === "number" ? killer.id : BigInt(killer.id)
				items.push(new Item(_item))
			}
		}
		if (items.length > 0) {
			killer.inventory.push(...items)
			killer.control.socket.send(sendItemsReceived(items))
		}
	}

	// reset player send upate cooldown
	// so next tick player will get fresh data
	// for the UI etc.
	killer.control._socketSentPlayerUpdateCd.reset()

	// DEBUG
	// console.log(`[Event.onEntityKill] killer "${killer.name} (${killer.level})" with exp: ${killed.baseExp}/${killed.jobExp}`)
}
