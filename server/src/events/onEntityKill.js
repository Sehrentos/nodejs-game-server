import { EXP_BASE, EXP_JOB } from "../../../shared/Constants.js"
import { TYPE } from "../../../shared/enum/Entity.js"
import { Item } from "../../../shared/models/Item.js"
import { getRandomInt } from "../utils/getRandomInt.js"
import { sendItemsReceived } from "./sendItemsReceived.js"
import { sendMapEntity } from "./sendMap.js"
import { sendPlayer } from "./sendPlayer.js"

/**
 * Handles the event when an entity is about to be killed.
 *
 * @param {import("../../../shared/models/Entity.js").Entity} killer - The entity responsible for the kill.
 * @param {import("../../../shared/models/Entity.js").Entity} killed - The entity that was killed.
 */
export function onEntityKill(killer, killed) {
	if (killed.type === TYPE.NPC) return // NPC can't die
	if (killed.type === TYPE.PORTAL) return // PORTAL can't die
	const timestamp = performance.now()

	killed.hp = 0
	killed.mp = 0
	killed.death = timestamp
	killed.control.stopMoveTo()
	killed.control.stopFollow()
	killed.control.stopAttack()

	killer.control.stopFollow()
	killer.control.stopAttack()

	// send killed player back to saved position
	if (killed.type === TYPE.PLAYER) {
		killed.control.toSavePosition()
		killed.control.revive()
	}

	// NEXT: reward the attacker, but only players can get exp
	if (killer.type !== TYPE.PLAYER) return

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

	// reward the player with items from the killed monster
	if (killed.type === TYPE.MONSTER) {
		/** @type {Item[]} */
		const rewardItems = []
		for (const item of killed.inventory) {
			// check drop change of item and reward it when it is dropped
			if (item.dropChange > 0 && getRandomInt(0, 100) <= item.dropChange) { // 0 - 100%
				rewardItems.push(item)
			}
		}
		// add items to inventory
		if (rewardItems.length > 0) {
			// killer.inventory.push(...items)
			// when item does already exist in the inventory, update the amount
			// else create new inventory item
			for (const item of rewardItems) {
				const existingItem = killer.inventory.find(itm => itm.id === item.id)
				if (existingItem) {
					existingItem.amount += item.amount
					// console.log(`[Event.onEntityKill] (existing) item "${item.id}" added to inventory (amount: ${item.amount} / now: ${existingItem.amount})`)
				} else {
					killer.inventory.push(new Item(item))
					// console.log(`[Event.onEntityKill] (new) item "${item.id}" added to inventory (amount: ${item.amount})`)
				}
			}

			// send received items packet
			killer.control.socket.send(sendItemsReceived(rewardItems))
			killer.control.socket.send(sendPlayer(killer, "baseExp", "jobExp", "level", "jobLevel", "inventory"))
		} else {
			// console.log(`[Event.onEntityKill] no items dropped by "${killed.name}" (gid: ${killed.gid})`)
			killer.control.socket.send(sendPlayer(killer, "baseExp", "jobExp", "level", "jobLevel"))
		}
	}

	// send entity update
	const world = killed.control.world
	const map = killed.control.map
	world.broadcastMap(map, sendMapEntity(killed, "hp", "mp", "death"))

	// DEBUG
	// console.log(`[Event.onEntityKill] killer "${killer.name} (${killer.level})" with exp: ${killed.baseExp}/${killed.jobExp}`)
}
