import { randomBytes } from 'node:crypto';
import { Player } from '../model/Player.js';
import { Packets } from '../Packets.js';

/**
 * @typedef {import("../WorldMap.js").WorldMap} WorldMap
 * @typedef {import("../model/Player.js").PlayerProps} PlayerProps
 * @typedef {Object} PlayerExtraProps
 * @prop {import("../World.js").World=} world - World instance.
 * @prop {import("ws").WebSocket=} socket - Websocket instance.
 * @typedef {PlayerProps & PlayerExtraProps} PlayerControlProps
 */

export class PlayerControl extends Player {
	/**
	 * Creates a new PlayerControl instance.
	 * @param {PlayerControlProps} p - Entity properties.
	 */
	constructor(p) {
		super(p)
		this.gid = p?.gid ?? randomBytes(4).toString('hex')
		this.world = p?.world ?? null
		this.socket = p?.socket ?? null

		// DEBUG, make player move really fast
		this.speed = 1

		this._onClose = this.onClose.bind(this)
		this._onError = this.onError.bind(this)
		this._onMessage = this.onMessage.bind(this)

		this.socket.on('close', this._onClose)
		this.socket.on('error', this._onError)
		this.socket.on('message', this._onMessage)
	}

	/**
	 * Called when a new WebSocket message is received from the player
	 * @param {Buffer|string} data 
	 * @param {boolean} isBinary 
	 */
	async onMessage(data, isBinary) {
		try {
			const json = JSON.parse(data.toString());
			// console.log(`WS ${process.pid} message:`, json);
			// we changed the login into Bearer header
			// don't login here
			// if (json.type === 'login') {
			// 	await this.onLogin(json)
			// } else 
			if (json.type === 'move') {
				await this.onMove(json)
			} else {
				console.log(`[TODO] ${process.pid} message:`, json)
			}
		} catch (e) {
			console.log(`WS ${process.pid} message:`, data.toString(), e.message || e)
		}
	}

	onClose() {
		console.log(`Player ${process.pid} connection closed.`);
		this.socket.off('close', this._onClose)
		this.socket.off('error', this._onError)
		this.socket.off('message', this._onMessage)
		this.world.onClientClose(this)
	}

	onError(error) {
		console.log(`WS ${process.pid} error:`, error.message || error || '[no-code]');
	}

	broadcast(data, isBinary = false) {
		this.world.broadcast(data, isBinary)
	}

	/**
	 * Function to handle the movement of a monster entity on each tick.
	 * It checks if the entity can move, updates its position based on speed and direction,
	 * and ensures it stays within the map boundaries and doesn't move excessively from the original position.
	 * 
	 * @param {number} timestamp `performance.now()` from the world.onTick
	 */
	onTick(timestamp) {
		// const deltaTime = timestamp - this.world.startTime // ms elapsed, since server started
		// console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)

		// update client map data on server update tick,
		// so the client can update the map with new entity positions
		this.socket.send(JSON.stringify(Packets.updateMap(this.map)));

		// send player update every 5 seconds
		if (!this._playerUpdate || timestamp - this._playerUpdate > 5000) {
			this._playerUpdate = timestamp
			// send packet to client, containing player data
			this.socket.send(JSON.stringify(Packets.updatePlayer(this)));
		}
	}

	// async onLogin(json) {
	// 	// TODO validate username
	// 	this.name = json.username
	// 	const map = await this.world.joinMap(this, 'lobby')
	// 	console.log(`Player ${this.id} joined ${map.name}`)
	// 	this.onEnterMap(map)
	// 	return true
	// }

	async onMove(json) {
		const timestamp = performance.now()

		// apply position update from player.speed and player.speedMultiplier
		if (this.movementStart === 0) {
			// this.movementStart = timestamp
		} else if (timestamp - this.movementStart < this.speed * this.speedMultiplier) {
			return
		}
		this.movementStart = timestamp

		switch (json.code) {
			case "KeyA":
			case "ArrowLeft":
				this.dir = 0
				if (this.x > 0) {
					this.x--
				}
				break
			case "KeyD":
			case "ArrowRight":
				this.dir = 1
				if (this.x < this.map.width) {
					this.x++
				}
				break
			case "KeyW":
			case "ArrowUp":
				this.dir = 2
				if (this.y > 0) {
					this.y--
				}
				break
			case "KeyS":
			case "ArrowDown":
				this.dir = 3
				if (this.y < this.map.height) {
					this.y++
				}
				break
			default:
				break
		}
	}

	/**
	 * Called when the player enters a map.
	 * @param {WorldMap} map - The map the player is entering
	 */
	onEnterMap(map) {
		this.map = map
		// Note: this is also send in onTick
		// send packet to client, containing player data
		this.socket.send(JSON.stringify(Packets.updatePlayer(this)));
	}
}