import { randomBytes } from 'node:crypto';
import { Monster } from '../model/Monster.js';
import { AI } from '../AI.js';
import { ELEMENT } from '../enum/Element.js';
import { inRangeOfEntity } from '../utils/EntityUtil.js';
import { DIRECTION } from '../enum/Entity.js';

export class MonsterControl extends Monster {
	/**
	 * Creates a new MonsterControl instance.
	 * @param {import("../model/Monster.js").TMonsterProps} p - Monster properties.
	 */
	constructor(p) {
		super(p)
		this.gid = p?.gid ?? randomBytes(16).toString('hex')
		this.ai = new AI(this)
		this.aspd = p?.aspd ?? 1000
	}

	/**
	 * Server update tick callback. Used to do animations etc.
	 * 
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	onTick(timestamp) {
		// const deltaTime = timestamp - this.world.startTime // ms elapsed, since server started
		// console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)

		// check if entity is alive
		if (this.hp <= 0) {
			// when entity has been dead for a 5-minutes, revive it
			// and move it to the original position
			if (timestamp - this.death > 5 * 60 * 1000) {
				this.revive()
				this.toSavePosition()
			} else {
				return // wait for revive
			}
		}

		// call AI onUpdate, if it exists
		this.ai.onUpdate(timestamp)

		// find entities in nearby
		// this.detectNearByEntities(4, timestamp)

		// start following target, this has no range limit
		// if (this._following != null) {
		// 	this.follow(this._following)
		// }
	}

	// /**
	//  * Finds entities in the given radius around the entity.
	//  * @param {number} radius - The radius to search for entities.
	//  * @param {number} timestamp `performance.now()` from the world.onTick
	//  */
	// detectNearByEntities(radius, timestamp) {
	// 	try {
	// 		const nearbyEntities = this.map.findEntitiesInRadius(this.lastX, this.lastY, radius)
	// 			.filter(entity => entity.gid !== this.gid) // exclude self
	// 		if (nearbyEntities.length === 0) return
	// 		for (const entity of nearbyEntities) {
	// 			if (entity.type === ENTITY_TYPE.PLAYER) {
	// 				// ...
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.error(`${this.constructor.name} ${this.gid} error:`, error.message || error || '[no-code]');
	// 	}
	// }

	/**
	 * Moves the entity in the specified direction if possible.
	 * The movement is based on the entity's direction and current speed.
	 * Updates the entity's position on the map while ensuring it stays within boundaries.
	 * The movement is constrained by a delay calculated from speed and speedMultiplier.
	 * 
	 * @param {number} dir - The direction to move the entity:
	 *   0: Left (x--), 1: Right (x++), 2: Up (y--), 3: Down (y++)
	 * @param {number=} timestamp - The current timestamp or performance.now().
	 */
	move(dir, timestamp) {
		if (this.hp <= 0) return // must be alive
		const _timestamp = timestamp || performance.now()

		// check if entity can move on this tick
		if (typeof this.movementStart === "number" && _timestamp - this.movementStart < this.speed * this.speedMultiplier) {
			return // can't move yet
		}
		this.movementStart = _timestamp

		switch (dir) {
			case DIRECTION.LEFT:
				this.dir = DIRECTION.LEFT
				if (this.lastX > 0) {
					this.lastX--
				}
				break
			case DIRECTION.RIGHT:
				this.dir = DIRECTION.RIGHT
				if (this.lastX < this.map.width) {
					this.lastX++
				}
				break
			case DIRECTION.UP:
				this.dir = DIRECTION.UP
				if (this.lastY > 0) {
					this.lastY--
				}
				break
			case DIRECTION.DOWN:
				this.dir = DIRECTION.DOWN
				if (this.lastY < this.map.height) {
					this.lastY++
				}
				break
			default:
				break
		}
	}

	/**
	 * Controls the attack logic of the entity.
	 * 
	 * @param {import("./EntityControl.js").TEntityControls} entity - The target entity to attack.
	 * @param {number} timestamp - The current timestamp in milliseconds.
	 */
	attack(entity, timestamp) {
		if (this.hp <= 0) return // can't attack if dead

		if (typeof this.attackStart === "number" && timestamp - this.attackStart < this.aspd * this.aspdMultiplier) {
			return // can't attack yet
		}
		// is in melee range
		if (!inRangeOfEntity(entity, this.lastX, this.lastY, this.range)) {
			return
		}
		this.attackStart = timestamp

		entity.takeDamage(this)
	}

	/**
	 * Handles the action when the entity takes a hit from an attacker.
	 * Reduces the entity's health points (hp) based on the attacker's
	 * strength, attack power, and attack multiplier. If the entity's hp
	 * falls to zero or below, the entity dies and is removed from the map.
	 * 
	 * @param {import("./MonsterControl").MonsterControl | import("./PlayerControl").PlayerControl} attacker - The attacking entity
	 *        attributes such as strength (str), attack
	 *        power (atk), and attack multiplier (atkMultiplier).
	 */
	takeDamage(attacker) {
		// must be alive
		if (this.hp <= 0) return
		// must be in the same map, to receive damage
		if (this.map !== attacker.map) {
			return
		}
		if (this.hp > 0) {
			// physical attacks are always neutral?
			// TODO take defence into account
			if (attacker.eAtk === ELEMENT.NEUTRAL) {
				this.hp -= (attacker.str + attacker.atk) * attacker.atkMultiplier;
			} else {
				this.hp -= (attacker.int + attacker.mAtk) * attacker.mAtkMultiplier;
			}
		}
		if (this.hp <= 0) {
			this.die(attacker)
		}
	}

	/**
	 * Removes the entity from the map.
	 * @param {import("./MonsterControl").MonsterControl | import("./PlayerControl").PlayerControl} attacker - The attacking entity
	 */
	die(attacker) {
		this.hp = 0
		this.mp = 0
		this.death = performance.now() // Date.now()
		this.attacking = null
		this._following = null
		// this.map.removeEntity(this)

		// @ts-ignore reward the attacker with exp
		if (attacker.onKill) attacker.onKill(this)
	}

	/**
	 * Reward the monster with exp for killing an entity.
	 * @param {import("./MonsterControl").MonsterControl | import("./PlayerControl").PlayerControl} entity - The killed entity
	 */
	onKill(entity) {
		// do nothing
	}

	/**
	 * Revives the entity by restoring their health points (hp) and
	 * mana points (mp) to their maximum values (hpMax and mpMax).
	 */
	revive() {
		this.hp = Number(this.hpMax)
		this.mp = Number(this.mpMax)
	}

	/**
	 * Moves the entity to their saved map and position.
	 */
	toSavePosition() {
		this.lastX = this.saveX
		this.lastY = this.saveY
	}

	/**
	 * Makes the entity follow another entity, by moving its position on each tick
	 * closer to the target entity. The target must be in the monster's range.
	 * If the target moves out of range or dies, the monster will stop following.
	 * @param {import("../model/Entity").TEntityProps} entity - The target entity to follow.
	 * @param {number=} timestamp - The current timestamp or performance.now().
	 */
	follow(entity, timestamp) {
		if (this.hp <= 0) return
		const _timestamp = timestamp || performance.now()
		this._following = entity

		// check if entity can move on this tick
		if (typeof this.movementStart === "number" && _timestamp - this.movementStart < this.speed * this.speedMultiplier) {
			return // can't move yet
		}
		this.movementStart = _timestamp

		// if target dies, stop following
		if (entity.hp <= 0) {
			this._following = null
			return
		}

		// stop at range
		if (inRangeOfEntity(entity, this.lastX, this.lastY, this.range)) {
			this._following = null
			return
		}

		// follow entity
		if (this.lastX > entity.lastX) {
			this.dir = DIRECTION.LEFT
			this.lastX--
		} else if (this.lastX < entity.lastX) {
			this.dir = DIRECTION.RIGHT
			this.lastX++
		}
		if (this.lastY > entity.lastY) {
			this.dir = DIRECTION.UP
			this.lastY--
		} else if (this.lastY < entity.lastY) {
			this.dir = DIRECTION.DOWN
			this.lastY++
		}
	}
}