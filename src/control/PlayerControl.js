import { randomBytes } from 'node:crypto';
import { Player } from '../data/player/Player.js';
import { Packets } from '../data/Packets.js';

/**
 * @typedef {import("../maps/WorldMap.js").WorldMap} WorldMap
 * @typedef {import("../data/player/Player.js").PlayerProps} PlayerProps
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

	async onTick(startTime) {
		// const deltaTime = Date.now() - startTime
		// console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)
		// update player data on server update tick
		this.socket.send(JSON.stringify(Packets.tick(this, this.map)));
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
		// check if entity can move
		if (this.movementStart === 0) {
			// this.movementStart = performance.now()
		} else if (performance.now() - this.movementStart < this.speed * this.speedMultiplier) {
			return
		}
		this.movementStart = performance.now()
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
		// response joined state
		this.socket.send(JSON.stringify(Packets.joinMap(this, map)));
	}
}