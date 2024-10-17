import { Entity } from "./Entity.js";

/**
 * @typedef {import("../World.js").World} World
 * @typedef {import("../maps/WorldMap.js").WorldMap} WorldMap
 * @typedef {import("ws").WebSocket} WebSocket
 * @typedef {import("http").IncomingMessage} IncomingMessage
 */

export class Player extends Entity {
	/**
	 * Called when a new WebSocket connection is established
	 * @param {World} world - The World instance
	 * @param {WebSocket} socket - The WebSocket connection
	 * @param {IncomingMessage} req - The HTTP request
	 */
	constructor(world, socket, req) {
		super(0, Entity.TYPE.PLAYER, 'player'); // TODO better UUID generation
		this.quests = []
		this.party = null // TODO { name: "CoolParty", leader: 0, members: [0, 1, 2] }
		this.speedMultiplier = 1

		/** @type {World} */
		this.world = world
		this.socket = socket
		// need to parse socket URI?
		// this.urlFrom = req.socket?.remoteAddress ?? '127.0.0.1'
		// this.urlTo = (req?.url ?? '').substring(1)
		// console.log(`WS ${process.pid} new player connection`, this.urlFrom, this.urlTo, this.id);

		this._onClose = this.onClose.bind(this)
		this._onError = this.onError.bind(this)
		this._onMessage = this.onMessage.bind(this)

		socket.on('close', this._onClose)
		socket.on('error', this._onError)
		socket.on('message', this._onMessage)
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
		this.socket.send(JSON.stringify({
			type: "tick",
			x: this.x,
			y: this.y,
			dir: this.dir,
			entities: Array.from(this.map.entities).map(([id, entity]) => ({
				//id, does the client need this?
				type: entity.type,
				name: entity.name,
				x: entity.x,
				y: entity.y,
				dir: entity.dir
			})),
		}));
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
		this.socket.send(JSON.stringify({
			type: "join",
			name: this.name,
			map: map.name,
			width: map.width,
			height: map.height,
			x: this.x,
			y: this.y,
			dir: this.dir,
			entities: Array.from(map.entities).map(([id, entity]) => ({
				//id, does the client need this?
				type: entity.type,
				name: entity.name,
				x: entity.x,
				y: entity.y,
				dir: entity.dir
			})),
		}));
	}
}