import WebSocket from 'ws';
import { WorldMap } from './maps/WorldMap.js';
import { Player } from './entities/Player.js';
import { Entity } from './entities/Entity.js';

/**
 * @typedef {import("ws").WebSocketServer} WebSocketServer
 * @typedef {import("http").IncomingMessage} IncomingMessage
 * @typedef {import("http").ServerResponse} ServerResponse
 */

/**
 * @module World
 * @description World class contains the world data like maps, Players, etc.
 */
export class World {
	constructor(socket) {
		/** @type {WebSocketServer} */
		this.socket = socket
		/** @type {Map<string, WorldMap>} */
		this.maps = new Map()
		/** total number of players, from server start */
		this.playersCountTotal = 0

		this.serverStartTime = performance.now()
		this.serverUpdateTime = performance.now()
		this.updateTick = setInterval(this.onTick.bind(this), 1000 / 15) // 1000 / 60

		// event bindings
		this.socket.on('connection', this.onConnection.bind(this))
	}

	/**
	 * Join a map (or create it if it doesn't exist), and tell the Player to join it
	 * @param {Player} player - The Player that wants to join the map
	 * @param {string} name - The name of the map to join (default: "lobby")
	 * @returns {Promise<WorldMap>} - The map that was joined
	 */
	async joinMap(player, name = "lobby") {
		let map = this.maps.get(name)
		if (map === undefined) {
			map = new WorldMap(name)
			if (name === "lobby") {
				// Note: lobby does not need to be loaded
				map.isLoaded = true
				map.width = 600
				map.height = 400
			}/* else { // TODO load map data
                await map.load()
            }*/
			this.maps.set(name, map)
			map.onCreate()
		}
		// update Player data
		player.map = map
		player.x = Math.round(map.width / 2)
		player.y = Math.round(map.height / 2)
		player.dir = 0
		// Player is also an Entity
		map.entities.set(player.id, player)
		return map
	}

	/**
	 * Called when a new WebSocket connection is established
	 * @param {WebSocket} ws - The WebSocket connection
	 * @param {IncomingMessage} req - The HTTP request
	 */
	async onConnection(ws, req) {
		this.playersCountTotal++
		const player = new Player(this, ws, req)
		// you can also read headers here
		// custom way of finding the access token
		// const authorization = req.headers['sec-websocket-protocol']; // ws, wss, Bearer.123
		// const token = authorization.split(' ').find(part => part.startsWith('Bearer.')).split('.')[1];
		console.log(`Player ${player.id} connection established.`/*, token*/)
		// TODO load user data from database
		player.name = `player-${this.playersCountTotal}`
		const map = await this.joinMap(player, 'lobby')
		console.log(`Player ${player.id} joined ${map.name}`)
		player.onEnterMap(map)
	}

	/**
	 * Called every tick, runs the onTick function of all clients in all maps
	 * @see Player.onTick
	 */
	onTick() {
		this.maps.forEach((map) => {
			map.entities.forEach((entity) => {
				entity.onTick(this.serverStartTime, this.serverUpdateTime)
			})
		})
		this.serverUpdateTime = performance.now()
	}

	broadcast(data, isBinary = false) {
		this.maps.forEach((map) => {
			map.entities.forEach((entity) => {
				// Entity with a socket is a Player
				if (entity.socket != null && entity.socket.readyState === WebSocket.OPEN) {
					entity.socket.send(data, { binary: isBinary });
				}
			})
		})
	}

	onClientClose(player) {
		console.log(`World ${process.pid} player disconnected.`);
		this.broadcast(JSON.stringify({ type: "leave", name: player.name }));
		// remove player from map
		this.maps.forEach((map) => {
			if (!map.entities.delete(player.id)) {
				console.log(`[WARN]: unable to remove player ${player.id} from map ${map.name}`)
			}
		})
	}

	/**
	 * Returns the number of players currently connected to the world.
	 * @return {Number} The number of players.
	 */
	getPlayerCount() {
		let count = 0
		this.maps.forEach((map) => {
			map.entities.forEach((entity) => {
				if (entity.type === Entity.TYPE.PLAYER) {
					count++
				}
			})
		})
		return count
	}
}