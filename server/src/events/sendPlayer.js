/**
 * @param {import("../../../shared/models/Entity.js").TEntityProps} player
 * @returns {import("../../../shared/models/Entity.js").TEntityProps}
 */
function getPlayerProps(player) {
	return {
		gid: player.gid,
		// aid: player.aid,
		spriteId: player.spriteId,
		name: player.name,
		lastMap: player.lastMap,
		lastX: player.lastX,
		lastY: player.lastY,
		size: player.size,
		dir: player.dir,
		hp: player.hp,
		hpMax: player.hpMax,
		mp: player.mp,
		mpMax: player.mpMax,
		level: player.level,
		jobLevel: player.jobLevel,
		baseExp: player.baseExp,
		jobExp: player.jobExp,
		money: player.money,
		range: player.range,
		atk: player.atk,
		atkMultiplier: player.atkMultiplier,
		mAtk: player.mAtk,
		mAtkMultiplier: player.mAtkMultiplier,
		eAtk: player.eAtk,
		eDef: player.eDef,
		def: player.def,
		defMultiplier: player.defMultiplier,
		mDef: player.mDef,
		mDefMultiplier: player.mDefMultiplier,
		dodge: player.dodge,
		dodgeMultiplier: player.dodgeMultiplier,
		speed: player.speed,
		str: player.str,
		agi: player.agi,
		vit: player.vit,
		int: player.int,
		dex: player.dex,
		luk: player.luk,
		hit: player.hit,
		hpRecovery: player.hpRecovery,
		mpRecovery: player.mpRecovery,
		job: player.job,
		sex: player.sex,
		//#region Arrays
		skills: player.skills,
		equipment: player.equipment,
		inventory: player.inventory,
		quests: player.quests,
		//#endregion
		partyId: player.partyId,
		latency: player.latency
	}
}
/**
 * Creates a "packet" containing the state of Player.
 *
 * Note: some properties are filtered on purpose, so the client does not know everything.
 *
 * @param {import("../../../shared/models/Entity.js").TEntityProps} player - A player object.
 * @param {string[]} [props] - optional. Specific player properties to send.
 * @returns {string} The JSON stringified packet.
 *
 * @typedef {Object} TPlayerPacket - Player update sent from the server
 * @prop {"player"} type
 * @prop {import("../../../shared/models/Entity.js").TEntityProps} player
 */
export function sendPlayer(player, ...props) {
	const type = "player"
	// if no props are specified, send all
	if (props.length === 0) {
		return JSON.stringify({
			type,
			player: getPlayerProps(player)
		})
	}

	// if props are specified, send only those
	const filteredProps = {}
	Object.keys(player).forEach(key => {
		if (props.includes(key)) {
			filteredProps[key] = player[key]
		}
	})

	return JSON.stringify({
		type,
		player: filteredProps
	})
}

/**
 *
 * @param {import("../../../shared/models/Entity.js").Entity} player
 * @returns {string|null} The JSON stringified packet. Returns null if there are no updates.
 *
 * @typedef {Object} TPlayerUpdatePacket - Player update sent from the server
 * @prop {"player"} type
 * @prop {import("../../../shared/models/Entity.js").TEntityProps} player
 */
export function sendPlayerUpdate(player) {
	if (player == null) return
	const delta = getDeltaUpdates(player)
	if (delta == null) return
	return JSON.stringify({ type: "player-update", player: delta })
}

/**
 * Returns a delta object containing the changed properties of an entity.
 * If no properties have changed, returns null.
 *
 * @param {import("../../../shared/models/Entity.js").TEntityProps} entity - The entity to check for changes.
 * @returns {null|import("../../../shared/models/Entity.js").TEntityProps} The object containing the changed properties, or null if no changes.
 */
function getDeltaUpdates(entity) {
	/**
	 * these are the properties that have changed.
	 * @type {import("../../../shared/models/Entity.js").TEntityProps}
	 */
	let entityProps = {}
	/**
	 * these are used to identify if an entity property has changed,
	 * since the last time it was checked from delta.
	 * @type {import("../../../shared/models/Entity.js").TEntityProps}
	 */
	let delta

	/**
	 * these are the allowed properties of a player
	 * @type {import("../../../shared/models/Entity.js").TEntityProps}
	 */
	const filteredProps = getPlayerProps(entity)

	// initialize delta object
	if (entity.delta == null) {
		entity.delta = {}
	}
	delta = entity.delta // for convenience

	// check if any property has changed
	for (const key in filteredProps) {
		if (['control', 'delta', 'latency'].includes(key)) continue
		if (entity[key] !== delta[key]) {
			entityProps = { ...entityProps, [key]: entity[key] }
			delta[key] = entity[key]
		}
	}

	// if no properties have changed, return null
	if (Object.keys(entityProps).length === 0) return

	// remove any circular references
	delete delta.control;

	// if properties have changed, return them
	return entityProps
}
