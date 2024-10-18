/**
 * @typedef {import("./Entity.js").Entity} Entity
 * @typedef {import("./player/Player.js").Player} Player
 * @typedef {import("./monster/Monster.js").Monster} Monster
 * @typedef {import("../maps/WorldMap.js").WorldMap} WorldMap
 * @typedef {import("../control/EntityControl.js").EntityControl} EntityControl
 * @typedef {import("../control/PlayerControl.js").PlayerControl} PlayerControl
 * @typedef {import("../control/MonsterControl.js").MonsterControl} MonsterControl
 * 
 * @typedef {Object} TickPacket
 * @prop {string} type - The packet type.
 * @prop {string} name - The player's name.
 * @prop {string} map - The name of the map the player is in.
 * @prop {number} width - The width of the map.
 * @prop {number} height - The height of the map.
 * @prop {Entity[]} entities - A list of entities.
 */

export const Packets = {
	/**
	 * Creates a "tick" packet containing the state of entities.
	 * 
	 * @param {PlayerControl} player - A player object.
	 * @param {WorldMap} map - A map object.
	 * 
	 * @returns {TickPacket} The packet object with type "tick" and a list of entities.
	 */
	tick: (player, map) => ({
		type: "tick",
		name: player.name,
		map: map.name,
		width: map.width,
		height: map.height,
		// @ts-ignore filtered on purpose
		entities: Array.from(map.entities).map(([gid, entity]) => ({
			gid,
			type: entity.type,
			name: entity.name,
			x: entity.x,
			y: entity.y,
			dir: entity.dir,
			hp: entity.hp,
			hpMax: entity.hpMax,
			mp: entity.mp,
			mpMax: entity.mpMax,
			//... TODO add other properties
		})),
	}),
	/**
	 * Creates a "join" map packet containing the state of entities.
	 * 
	 * @param {PlayerControl} player - A player object.
	 * @param {WorldMap} map - A map object.
	 * 
	 * @returns {TickPacket} The packet object with type "join".
	 */
	joinMap: (player, map) => ({ // TODO is this needed? tick does this already
		type: "join",
		name: player.name,
		map: map.name,
		width: map.width,
		height: map.height,
		// @ts-ignore filtered on purpose
		entities: Array.from(map.entities).map(([gid, entity]) => ({
			gid,
			type: entity.type,
			name: entity.name,
			x: entity.x,
			y: entity.y,
			dir: entity.dir,
			hp: entity.hp,
			hpMax: entity.hpMax,
			mp: entity.mp,
			mpMax: entity.mpMax,
			//... TODO add other properties
		})),
	}),
}