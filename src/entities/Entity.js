import { AI } from './AI.js'

export class Entity {
	constructor(id, type, name) {
		// TODO better uuid generation
		this.id = id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
		this.ai = new AI(this)
		this.type = type || Entity.TYPE.NPC
		this.name = name || ''
		/** @type {null|undefined|import('../maps/WorldMap.js').WorldMap} - The map this entity is in */
		this.map = null
		this.hp = 1
		this.hpMax = 1
		this.mp = 1
		this.mpMax = 1
		this.x = 0
		this.y = 0
		this._x = 0 // copy of the original position
		this._y = 0 // copy of the original position
		this.dir = 0
		this.level = 1
		this.baseExp = 0
		this.jobExp = 0
		this.atk = 1
		this.atkMultiplier = 1
		this.mAtk = 1
		this.mAtkMultiplier = 1
		this.speed = 100
		this.speedMultiplier = 2.5
		this.aspd = 1
		this.aspdMultiplier = 1
		this.def = 1
		this.mDef = 1
		this.str = 1
		this.agi = 1
		this.vit = 1
		this.dex = 1
		this.luk = 1
		this.job = 0
		this.sex = 0
		this.elementAtk = Entity.ELEMENT.NEUTRAL
		this.elementDef = Entity.ELEMENT.NEUTRAL
		this.equipment = []
		this.inventory = []
		this.skills = []
		/** start time of movement in ms */
		this.movementStart = 0
		this.iddleStart = 0
	}

	static TYPE = {
		NPC: 0,
		PLAYER: 1,
		MONSTER: 2,
	}

	static ELEMENT = {
		NEUTRAL: 0,
		FIRE: 1,
		ICE: 2,
		HOLY: 3,
		DARK: 4,
		EARTH: 5,
		WIND: 6,
		POISON: 7,
		GHOST: 8,
		UNDEAD: 9,
	}

	/**
	 * Function to handle the movement of a monster entity on each tick.
	 * It checks if the entity can move, updates its position based on speed and direction,
	 * and ensures it stays within the map boundaries and doesn't move excessively from the original position.
	 * 
	 * @param {number} startTime server start time
	 * @param {number} updateTime last update time
	 */
	onTick(startTime, updateTime) {
		// const deltaTime = performance.now() - startTime // ms elapsed, since server started
		// const deltaUpdateTime = performance.now() - updateTime // ms elapsed, since last server update
		this.ai?.onUpdate(startTime, updateTime)
	}

	// onCreate() {}

	onDelete() {
		console.log(`Entity ${this.id} delete.`)
	}
}