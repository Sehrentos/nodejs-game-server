import WebSocket, { WebSocketServer } from 'ws';
import { WorldMap } from './maps/WorldMap.js';
import { Entity } from './model/Entity.js';
import { ENTITY_TYPE } from './enum/Entity.js';
import * as Packets from './Packets.js';
import { verifyToken } from './utils/jwt.js';
import { Database } from './db/Database.js';
import MapLobbyTown from './maps/MapLobbyTown.js';
import MapPlainFields1 from './maps/MapPlainFields1.js';
import MapPlainFields2 from './maps/MapPlainFields2.js';
import { EntityControl } from './control/EntityControl.js';
import { createGameId } from './utils/EntityUtil.js';

/**
 * @module World
 * @description World class contains the world data like maps, Players, etc.
 */
export class World {
	/**
	 * Initializes a new instance of the World class.
	 * Sets up the WebSocket server and binds it to the provided server instance.
	 * Initializes properties related to maps and player tracking.
	 * @param {import("http").Server} server - The HTTP/HTTPS server instance to bind the WebSocket server to.
	 */
	constructor(server) {
		/** @type {WebSocketServer} */
		this.socket = new WebSocketServer({
			server, // bind to server instance.
			// host: '127.0.0.1', // {String} The hostname where to bind the server.
			// port: 5999, // {Number} The port number on which to listen.
			clientTracking: false, // {Boolean} Specifies whether or not to track clients.
			// maxPayload: 104857600, // {Number} The maximum allowed message size in bytes. Defaults to 100 MiB (104857600 bytes).
			skipUTF8Validation: false, // {Boolean} Specifies whether or not to skip UTF-8 validation for text and close messages. Defaults to false. Set to true only if clients are trusted.
			perMessageDeflate: false, // {Boolean|Object} Enable/disable permessage-deflate.
		})

		/** @type {Database} - database instance */
		this.db = new Database();
		this.dbPools = [];

		/** @type {Array<WorldMap>} - Game maps */
		this.maps = [
			new MapLobbyTown({ world: this }),
			new MapPlainFields1({ world: this }),
			new MapPlainFields2({ world: this }),
		]

		/** @type {number} - total number of players, from server start */
		this.playersCountTotal = 0

		/** @type {number} - timestamp of server start */
		this.serverStartTime = performance.now()

		/** @type {NodeJS.Timeout} - update interval */
		this.updateTick = setInterval(this.onTick.bind(this), 1000 / 15) // 1000 / 60

		// event bindings
		this.socket.on('connection', this.onConnection.bind(this))

		// graceful shutdown
		process.on('SIGINT', this.onExit.bind(this))
	}

	onExit() {
		console.log('World SIGINT signal received. Close all connections and exit.')
		clearInterval(this.updateTick)
		this.socket.close()
		this.dbPools.forEach(pool => pool.end())
		this.db.close()
		process.exit(0)
	}

	/**
	 * Join a map (or create it if it doesn't exist), and tell the Player to join it
	 * @param {Entity} player - The Player that wants to join the map
	 * @param {string} mapName - The name of the map to join (default: "Lobby town")
	 * @param {number} x - The x coordinate of the map to join (default: -1)
	 * @param {number} y - The y coordinate of the map to join (default: -1)
	 * @returns {Promise<WorldMap>} - The map that was joined
	 */
	async joinMapByName(player, mapName = "Lobby town", x = -1, y = -1) {
		// check if map exists
		let map = this.maps.find(m => m.name === mapName)
		if (!map) {
			// @ts-ignore create new map from map data
			// map = new WorldMap(this, MAPS.find(m => m.name === mapName) || { name: mapName })
			// this.maps.push(map)
			console.log(`[TODO] Map '${mapName}' not found.`)
			return
		}
		// load assets
		if (!map.isLoaded) {
			await map.load()
		}
		// create entities
		if (!map.isCreated) {
			await map.create()
		}
		// update Player data, so the player can join the map
		map.playerEnterMap(player, x, y)
		return map
	}

	/**
	 * Called when a new WebSocket connection is established.
	 * Validates the token and creates a new EntityControl instance.
	 * 
	 * @param {WebSocket} ws - The WebSocket connection
	 * @param {import("http").IncomingMessage} req - The HTTP request
	 */
	async onConnection(ws, req) {
		// TODO rate limitter for the WS connection
		// authentication
		// custom way of finding the access token in websocket headers
		const protocol = req.headers['sec-websocket-protocol']; //="ws, wss, Bearer.123"
		// const urlFrom = req.socket?.remoteAddress ?? '127.0.0.1';
		// const urlTo = (req?.url ?? '').substring(1);
		// console.log('Player connection established.', urlFrom, urlTo, protocol)
		if (!protocol) {
			ws.close(4401, 'Missing Bearer in Sec-WebSocket-Protocol header');
			return;
		}
		const token = protocol.split(' ').find(part => part.startsWith('Bearer.')).split('Bearer.')[1];
		if (!token) {
			ws.close(4401, 'Missing Bearer in Sec-WebSocket-Protocol header');
			return;
		}
		// validate token
		let payload;
		try {
			payload = await verifyToken(token);
		} catch (err) {
			ws.close(4401, 'Invalid Bearer in Sec-WebSocket-Protocol header');
			return;
		}
		const datetime = new Date().toLocaleString();
		const tokenExpires = new Date(payload.exp * 1000).toLocaleString();
		console.log(`[DB#world] token verified, account_id:${payload.id}, created:${datetime}, expires:${tokenExpires}`)

		// token is valid, load user data from database
		let conn, account, player;
		try {
			conn = await this.db.connect()

			// Note: find the account with same token
			// TODO disable multiple logins on the same account
			// account = await this.db.account.login(payload.username, payload.password);
			account = await this.db.account.loginToken(token);
			if (!account) {
				throw Error('Invalid credentials');
			}

			// Authorized, create new player or load existing player
			this.playersCountTotal++
			player = new Entity({
				type: ENTITY_TYPE.PLAYER,
				id: account.id,
				aid: account.id,
				gid: createGameId(), // generate unique id for player
				name: `player-${this.playersCountTotal}`,
				saveMap: 'Lobby town',
				saveX: 300,
				saveY: 200,
				speed: 1, // DEBUG, make player move really fast
				range: 10, // DEBUG, make player attack range longer
			})

			// load players data from database
			let players = await this.db.player.getByAccountId(account.id)
			console.log(`[DB#world] ${players.length} players found`)

			// create new player if not found
			if (players.length === 0) {
				let { insertId } = await this.db.player.add(player)
				player.id = insertId // update player id
			} else {
				// assign existing player data
				Object.assign(player, players[0])
			}

			// set player controller
			player.control = new EntityControl(player, this, ws/*, map */)

			console.log(`[DB#world] Player "${player.name}" (id:${player.id} aid:${player.aid} gid:${player.gid}) connection established.`)

			// make the player join map and update entity map property
			this.joinMapByName(
				player,
				player.lastMap || 'Lobby town',
				player.lastX || -1,
				player.lastY || -1
			)
		} catch (err) {
			console.log('[DB#world] Error', err.message, err.code || '')
			ws.close(4401, 'Invalid credentials')
		} finally {
			if (conn) conn.end();
		}
	}

	/**
	 * Called every tick, runs the onTick function of all clients in all maps
	 */
	onTick() {
		const timestamp = performance.now()
		for (const map of this.maps) {
			for (let entity of map.entities) {
				try {
					entity.control.onTick(timestamp)
				} catch (err) {
					console.log(`[World]: ${entity.name} onTick error`, err, entity)
				}
			}
		}
	}

	/**
	 * Sends a message to all players in all maps.
	 * @param {string|Buffer} data - The message to be sent.
	 * @param {boolean} [isBinary=false] - Whether the data is a Buffer or a string. If true, the data is sent as a binary message.
	 */
	broadcast(data, isBinary = false) {
		for (const map of this.maps) {
			for (let entity of map.entities) {
				// Entity with a socket is also Player
				if (entity.type === ENTITY_TYPE.PLAYER && entity.control.socket.readyState === WebSocket.OPEN) {
					entity.control.socket.send(data, { binary: isBinary });
				}
			}
		}
	}

	/**
	 * Called when a player disconnects from the world.
	 * Logs the disconnection of the player and broadcasts a leave message.
	 * Removes the disconnected player from the map entities.
	 * @param {Entity} player - The player who disconnected.
	 */
	async onClientClose(player) {
		console.log(`World player disconnected.`);

		this.broadcast(JSON.stringify(Packets.playerLeave(player.name)));

		// save player data
		const { affectedRows } = await this.db.player.update(player)
		const state = affectedRows > 0 ? 'saved' : 'not saved'
		console.log(`[DB#world] Player ${player.name} ${state} (id:${player.id}) disconnected.`)

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