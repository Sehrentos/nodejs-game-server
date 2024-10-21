import WebSocket from 'ws';
import { WorldMap } from './WorldMap.js';
import { PlayerControl } from './control/PlayerControl.js';
import { ENTITY_TYPE } from './enum/Entity.js';
import { maps } from './data/maps.js';

/**
 * @module World
 * @description World class contains the world data like maps, Players, etc.
 */
export class World {
	constructor(socket) {
		/** @type {import("ws").WebSocketServer} */
		this.socket = socket
		/** @type {Array<WorldMap>} */
		this.maps = []
		/** @type {number} - total number of players, from server start */
		this.playersCountTotal = 0

		this.serverStartTime = performance.now()
		this.updateTick = setInterval(this.onTick.bind(this), 1000 / 15) // 1000 / 60

		// event bindings
		this.socket.on('connection', this.onConnection.bind(this))
	}

	/**
	 * Join a map (or create it if it doesn't exist), and tell the Player to join it
	 * @param {PlayerControl} player - The Player that wants to join the map
	 * @param {string} mapName - The name of the map to join (default: "lobby")
	 * @param {number} x - The x coordinate of the map to join (default: -1)
	 * @param {number} y - The y coordinate of the map to join (default: -1)
	 * @returns {Promise<WorldMap>} - The map that was joined
	 */
	async joinMapByName(player, mapName = "lobby", x = -1, y = -1) {
		// check if map exists
		let map = this.maps.find(m => m.name === mapName)
		if (!map) {
			// @ts-ignore create new map from map data
			map = new WorldMap(this, maps.find(m => m.name === mapName) || { name: mapName })
			if (!map.isLoaded) {
				await map.load()
			}
			this.maps.push(map)
			map.onCreate()
		}
		// update Player data, so the player can join the map
		map.enterMap(player, x, y)
		return map
	}

	/**
	 * Called when a new WebSocket connection is established
	 * @param {WebSocket} ws - The WebSocket connection
	 * @param {import("http").IncomingMessage} req - The HTTP request
	 */
	async onConnection(ws, req) {
		this.playersCountTotal++
		const player = new PlayerControl({ world: this, socket: ws })
		// TODO load user data from database, like id etc.
		player.id = this.playersCountTotal
		// you can also read headers here
		// custom way of finding the access token
		// const authorization = req.headers['sec-websocket-protocol']; // ws, wss, Bearer.123
		// const token = authorization.split(' ').find(part => part.startsWith('Bearer.')).split('.')[1];
		console.log(`Player ${player.id} connection established.`/*, token*/)
		// TODO load user data from database
		player.name = `player-${this.playersCountTotal}`
		await this.joinMapByName(player, 'lobby')
	}

	/**
	 * Called every tick, runs the onTick function of all clients in all maps
	 * @see PlayerControl.onTick
	 */
	onTick() {
		const timestamp = performance.now()
		for (const map of this.maps) {
			for (let entity of map.entities) {
				entity.onTick(timestamp)
			}
		}
	}

	broadcast(data, isBinary = false) {
		for (const map of this.maps) {
			for (let entity of map.entities) {
				// Entity with a socket is a Player
				if (entity instanceof PlayerControl && entity.socket.readyState === WebSocket.OPEN) {
					entity.socket.send(data, { binary: isBinary });
				}
			}
		}
	}

	/**
	 * Called when a player disconnects from the world.
	 * Logs the disconnection of the player and broadcasts a leave message.
	 * Removes the disconnected player from the map entities.
	 * @param {PlayerControl} player - The player who disconnected.
	 */
	onClientClose(player) {
		console.log(`World ${process.pid} player disconnected.`);
		this.broadcast(JSON.stringify({ type: "leave", name: player.name }));
		// remove player from map
		this.maps.forEach((map) => {
			// TODO can you match entity === player?
			map.entities = map.entities.filter((entity) => entity.gid !== player.gid)
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
				if (entity.type === ENTITY_TYPE.PLAYER) {
					count++
				}
			})
		})
		return count
	}
}