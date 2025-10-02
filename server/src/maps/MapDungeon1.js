import { Entity } from '../../../shared/models/Entity.js'
import { ENTITY_TYPE } from '../../../shared/enum/Entity.js'
import { WorldMap } from '../../../shared/models/WorldMap.js'
import { EntityControl } from '../control/EntityControl.js'
import createGameId from '../utils/createGameId.js'
import createMonster from '../utils/createMonster.js'
import { MOBS } from '../../../shared/data/MOBS.js'
import { SPR_ID } from '../../../shared/enum/Sprite.js'

// create map
export default class MapDungeon1 extends WorldMap {
	/** @param {import("../../../shared/models/WorldMap.js").TWorldMapProps} props */
	constructor(props = {}) {
		super({
			id: 9,
			spriteId: SPR_ID.MAP_DUNGEON_1,
			name: "Dungeon 1",
			width: 2000,
			height: 1400,
			isLoaded: true, // no assets to load
			...props
		})
	}

	/**
	 * Loads the map data asynchronously.
	 * Sets the map's `isLoaded` property to true upon successful loading.
	 * @returns {Promise<void>}
	 */
	async load() {
		// load any assets etc.
		// ...
		this.isLoaded = true
	}

	/**
	 * Map onCreate callback
	 * @returns {Promise<void>}
	 */
	async create() {
		this.isCreated = true
		// create map entities
		this.entities = [
			new Entity({
				type: ENTITY_TYPE.PORTAL,
				lastX: this.width / 2,
				lastY: 20,
				portalName: "Lobby town",
				portalX: 958,
				portalY: 1308,
				range: 32,
				w: 32,
				h: 32,
			}),
			...createMonster(this, 5, { ...MOBS.GHOST }),
			...createMonster(this, 10, { ...MOBS.SNAKE }),
			...createMonster(this, 10, { ...MOBS.ORC2 }),
			new Entity({
				...MOBS.SKELETON,
				lastX: (this.width / 2),
				lastY: (this.height / 2),
				dir: 0,
				saveX: (this.width / 2),
				saveY: (this.height / 2)
			}, { // event emitter
				"damage": onSkeletonDamage
			}),
		]
		// add controllers and game ids
		this.entities.forEach((entity) => {
			entity.gid = createGameId()
			entity.control = new EntityControl(entity, this.world, null, this)
		})

		console.log(`[${this.constructor.name}] "${this.name}" is created with ${this.entities.length} entities.`)
	}
}

// Test entity event emitter
function onSkeletonDamage(attackerGid, gid, lastHp, curHp) {
	console.log("Skeleton damaged", attackerGid, gid, lastHp, curHp)
	// "Skeleton damaged c2a126669331a55b97ea728fc4b273f7 215f93b6e21d34c6ebca41194cff3010 4325 4190"
}
