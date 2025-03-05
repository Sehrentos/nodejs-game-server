import WebSocket, { WebSocketServer } from 'ws';
import { WorldMap } from './models/WorldMap.js';
import { Entity } from './models/Entity.js';
import { DIRECTION, ENTITY_TYPE } from './enum/Entity.js';
import * as Packets from './Packets.js';
import { verifyToken } from './utils/jwt.js';
import { Database } from './db/Database.js';
import MapLobbyTown from './maps/MapLobbyTown.js';
import MapPlainFields1 from './maps/MapPlainFields1.js';
import MapPlainFields2 from './maps/MapPlainFields2.js';
import { EntityControl } from './control/EntityControl.js';
import createGameId from './utils/createGameId.js';
import { PLAYER_BASE_HP_REGEN, UPDATE_TICK } from './Constants.js';
import MapFlowerTown from './maps/MapFlowerTown.js';
import MapCarTown from './maps/MapCarTown.js';
import MapUnderWater1 from './maps/MapUnderWater1.js';
import MapUnderWater2 from './maps/MapUnderWater2.js';

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
			new MapLobbyTown({ world: this }), // 1
			new MapFlowerTown({ world: this }), // 2
			new MapCarTown({ world: this }), // 3
			new MapUnderWater1({ world: this }), // 4
			new MapUnderWater2({ world: this }), // 5
			new MapPlainFields1({ world: this }), // 6
			new MapPlainFields2({ world: this }), // 7
		]

		/** @type {number} - total number of players, from server start */
		this.playersCountTotal = 0

		/** @type {number} - timestamp of server start */
		this.serverStartTime = performance.now()

		/** @type {boolean} - `true` when server is being closed */
		this.isClosing = false

		/** @type {NodeJS.Timeout} - update interval */
		this.updateTick = setInterval(this.onTick.bind(this), UPDATE_TICK)

		// event bindings
		this.socket.on('connection', this.onConnection.bind(this))

		// graceful shutdown
		process.on('SIGINT', this.onExit.bind(this))
	}

	async onExit() {
		this.isClosing = true
		try {
			console.log('[World] SIGINT signal received. Close all connections and exit.')
			clearInterval(this.updateTick) // stop update tick
			// disconnect all players
			for (const map of this.maps) {
				for (let entity of map.entities) {
					if (entity.type === ENTITY_TYPE.PLAYER && entity.control.socket.readyState === WebSocket.OPEN) {
						// terminate client connection
						entity.control.socket.close()
						// save player data
						let { affectedRows } = await this.db.player.update(entity)
						console.log(`[World] (id:${entity.id}) "${entity.name}" is ${affectedRows > 0 ? 'saved' : 'not saved'}.`)
					}
				}
			}
			// logout all accounts
			await this.db.account.logoutAll(false)
			// close databases
			this.socket.close()
			this.dbPools.forEach(pool => pool.end())
			this.db.close()
		} catch (e) {
			console.log('[World] SIGINT signal received. Close all connections and exit. But players was not saved due to an error:', e.message)
		} finally {
			process.exit(0)
		}
	}

	/**
	 * Join a map (or create it if it doesn't exist), and tell the Player to join it
	 * @param {Entity} player - The Player that wants to join the map
	 * @param {string|number} mapNameOrId - The name or ID of the map to join (default: "Lobby town")
	 * @param {number} x - The x coordinate of the map to join (default: -1)
	 * @param {number} y - The y coordinate of the map to join (default: -1)
	 * @returns {Promise<WorldMap>} - The map that was joined
	 */
	async joinMap(player, mapNameOrId = "Lobby town", x = -1, y = -1) {
		// check if map exists
		let map = this.maps.find(m => typeof mapNameOrId === "string" ? (m.name === mapNameOrId || m.id === parseInt(mapNameOrId)) : mapNameOrId)
		if (!map) {
			// @ts-ignore create new map from map data
			// map = new WorldMap(this, MAPS.find(m => m.name === mapName) || { name: mapName })
			// this.maps.push(map)
			console.log(`[World] joinMap '${mapNameOrId}' not found.`)
			return
		}
		// load any map assets async
		if (!map.isLoaded) {
			await map.load()
		}
		// create entities async
		if (!map.isCreated) {
			await map.create()
		}
		// update Player data, so the player can join the map
		await this.addEntityToMap(map, player, x, y)
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
		// console.log('[World] Player connection established.', urlFrom, urlTo, protocol)
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
		console.log(`[World] token verified, account_id:${payload.id}, created:${datetime}, expires:${tokenExpires}`)

		// token is valid, load user data from database
		let conn, player, account;
		try {
			conn = await this.db.connect()

			// Note: find the account with same token
			// account = await this.db.account.login(payload.username, payload.password);
			account = await this.db.account.loginToken(token);

			// when multiple logins on the same account
			// send notification and close connection
			player = this.getPlayerByAccount(account.id);
			if (player) {
				player.control.socket.send(JSON.stringify(Packets.updateChat(
					'default',
					'Security',
					player.name,
					'Some one just logged into this account, but you are already logged in.'
				)));
				player.control.socket.close();
				// await here for a brief moment to save player data
				await new Promise(resolve => setTimeout(resolve, 3000)); // 3s should be enough
			}

			// TODO check if account is banned and other states

			// Authorized, create new player or load existing player
			this.playersCountTotal = await this.db.player.count()

			// create new player
			// set default values
			player = new Entity({
				type: ENTITY_TYPE.PLAYER,
				aid: account.id,
				gid: createGameId(), // generate unique id for player
				name: `player-${this.playersCountTotal}`, // initial name
				// saveMap: 'Lobby town',
				// saveX: 875,
				// saveY: 830,
				speed: 30, // X step in ms per tick, lower is faster
				hpRecovery: PLAYER_BASE_HP_REGEN,
			})

			// load players data from database
			let players = await this.db.player.getByAccountId(account.id)
			console.log(`[World] (${account.id}) account has ${players.length} players. Server has ${this.playersCountTotal} players.`)

			// create new player if not found
			if (players.length === 0) {
				// Note: insertId can be BigInt or Number
				// JSON.stringify can't convert BigInt
				let { insertId } = await this.db.player.add(player)
				player.id = insertId // update player id
			} else {
				// merge existing player data from db
				Object.assign(player, players[0])
			}

			// set player controller
			// Note: control.map will be set in onEnterMap
			player.control = new EntityControl(player, this, ws/*, map */)

			console.log(`[World] Player "${player.name}" (id:${player.id} aid:${player.aid} lastLogin:${player.lastLogin}) connection established.`)

			// make the player join map and update entity map property
			this.joinMap(
				player,
				player.lastMap || 'Lobby town',
				player.lastX || -1,
				player.lastY || -1
			)
		} catch (err) {
			console.log('[World] Error', err.message, err.code || '')
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
					console.log(`[World] ${entity.name} onTick error`, err, entity.aid, entity.name)
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
	 * Called when a player disconnects from the world server.
	 * Logs the disconnection of the player and broadcasts a leave message.
	 * Removes the disconnected player from the map entities.
	 * @param {Entity} player - The player who disconnected.
	 */
	async onClientClose(player) {
		if (this.isClosing) return // Skip, server closing process is handled in onExit method

		this.broadcast(JSON.stringify(Packets.playerLeave(player.name)));

		// do logout by setting state=0
		await this.db.account.logout(player.aid, false);

		// save player data
		const { affectedRows } = await this.db.player.update(player)
		const state = affectedRows > 0 ? 'saved' : 'not saved'
		console.log(`[World] Player "${player.name}" (id:${player.id}) disconnected. State is ${state}`)

		// remove player from map
		this.maps.forEach((map) => {
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

	/**
	 * Returns player with the given account ID if it exists in any of the maps.
	 * @param {number|string} id - The account ID to check for.
	 * @returns {Entity|undefined} - Returns Entity if the player is found, otherwise `undefined`.
	 */
	getPlayerByAccount(id) {
		for (const map of this.maps) {
			for (const entity of map.entities) {
				if (entity.aid === id) {
					return entity
				}
			}
		}
	}

	/**
	 * Move the player to a new map.
	 * - First, the player's onLeaveMap method is called.
	 * - Remove the player from any old maps first.
	 * - The player's position is set to (x, y) or the center of the map if the params are negative.
	 * - The player's direction is set to 0 (DIRECTION.DOWN).
	 * - The player is added to the new map's entities list.
	 * - Finally, the player's onEnterMap method is called.
	 * 
	 * @param {WorldMap} map - The map to enter.
	 * @param {Entity} player - The player to enter the map.
	 * @param {number} [x=-1] - The x coordinate of the player's position.
	 * @param {number} [y=-1] - The y coordinate of the player's position.
	 */
	async addEntityToMap(map, player, x = -1, y = -1) {
		const oldMap = player.control.map
		// entity event
		await player.control.onLeaveMap(map, oldMap)

		// remove player from old maps
		this.removeEntityFromMaps(player)

		// IMPORTANT: update map controller
		player.control.map = map
		// x/y coords or center of map
		player.lastMap = map.name
		player.lastX = x >= 0 ? x : Math.round(map.width / 2)
		player.lastY = y >= 0 ? y : Math.round(map.height / 2)
		player.dir = DIRECTION.DOWN
		map.entities.push(player)

		// entity event
		return player.control.onEnterMap(map, oldMap)
	}

	/**
	 * Removes the given entity from the maps
	 * 
	 * @param {Entity} entity - The entity to remove.
	 */
	removeEntityFromMaps(entity) {
		for (const map of this.maps) {
			map.entities = map.entities.filter((e) => e.gid !== entity.gid)
		}
	}
}