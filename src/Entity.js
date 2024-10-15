export class Entity {
    constructor(id, type, name) {
        // TODO better uuid generation
        this.id = id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this.ai = null
        this.type = type || Entity.TYPE.NPC
        this.name = name || ''
        /** @type {null|undefined|import('./WorldMap.js').WorldMap} - The map this entity is in */
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
        if (this.type === Entity.TYPE.MONSTER && this.hp > 0 && this.map != null) {
            // check if entity can move
            if (this.movementStart === 0) {
                // this.movementStart = performance.now()
            } else if (performance.now() - this.movementStart < this.speed * this.speedMultiplier) {
                return
            }
            this.movementStart = performance.now()
            // console.log(`Entity ${this.id} (${startTime} / ${deltaTime}) tick`)
            // make monster move in square pattern
            // dir = 0 it will not move straight down (y++)
            // dir = 1 it will not move straight right (x++)
            // dir = 2 it will not move straight up (y--)
            // dir = 3 it will not move straight left (x--)
            // it can't move out of the map max width/height
            // it can't mode more than 10 times from the original _y/_x positions
            if (this.dir === 0) {
                if ((this.y < this._y + 10) && this.y < this.map.height) {
                    this.y++
                } else {
                    this.dir = 1//Math.floor(Math.random() * 3) + 1//Math.floor(Math.random() * 4)
                }
            }
            if (this.dir === 1) {
                if ((this.x < this._x + 10) && this.x < this.map.width) {
                    this.x++
                } else {
                    this.dir = 2//Math.floor(Math.random() * 4)
                }
            }
            if (this.dir === 2) {
                if ((this.y > this._y - 10) && this.y > 0) {
                    this.y--
                } else {
                    this.dir = 3//Math.floor(Math.random() * 4)
                }
            }
            if (this.dir === 3) {
                if ((this.x > this._x - 10) && this.x > 0) {
                    this.x--
                } else {
                    this.dir = 0
                }
            }
        }
    }

    onDelete() {
        console.log(`Entity ${this.id} delete.`)
    }
}