import WebSocket, { WebSocketServer } from 'ws';
import { WorldMap } from '../../shared/models/WorldMap.js';
import { Entity } from '../../shared/models/Entity.js';
import { TYPE } from '../../shared/enum/Entity.js';
import { verifyToken } from './utils/jwt.js';
import DB from './db/index.js';
import MapLobbyTown from './maps/MapLobbyTown.js';
import MapPlainFields1 from './maps/MapPlainFields1.js';
import MapPlainFields2 from './maps/MapPlainFields2.js';
import MapPlainFields3 from './maps/MapPlainFields3.js';
import { UPDATE_TICK } from '../../shared/Constants.js';
import MapFlowerTown from './maps/MapFlowerTown.js';
import MapCarTown from './maps/MapCarTown.js';
import MapUnderWater1 from './maps/MapUnderWater1.js';
import MapUnderWater2 from './maps/MapUnderWater2.js';
import MapDungeon1 from './maps/MapDungeon1.js';
import { sendChat } from './events/sendChat.js';
import { addEntityToMap, createPlayerEntity } from './actions/entity.js';

/**
 * @module World
 * @description World class contains the world data like websocket server, database instance, maps, players, etc.
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

		// /** @type {import('./db/index.js').Database} - database instance */
		// this.db = DB;
		// this.dbPools = []; // mariadb

		/** @type {Array<WorldMap>} - Game maps */
		this.maps = [
			new MapLobbyTown({ world: this }),
			new MapFlowerTown({ world: this }),
			new MapCarTown({ world: this }),
			new MapUnderWater1({ world: this }),
			new MapUnderWater2({ world: this }),
			new MapPlainFields1({ world: this }),
			new MapPlainFields2({ world: this }),
			new MapPlainFields3({ world: this }),
			new MapDungeon1({ world: this }),
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

	/**
	 * SIGINT signal handler. Close all connections and exit.
	 * @returns {Promise<void>}
	 */
	async onExit() {
		this.isClosing = true
		try {
			console.log('[World] SIGINT signal received. Close all connections and exit.')
			clearInterval(this.updateTick) // stop update tick
			// disconnect all players
			for (const map of this.maps) {
				for (let entity of map.entities) {
					if (entity.type !== TYPE.PLAYER || entity.control.socket.readyState === WebSocket.OPEN) continue;
					// terminate client connection
					entity.control.socket.close()
					// save player data
					let player = await DB.player.sync(entity) // returns={id:number}
					console.log(`[World (debug)] (id:${entity.id}) "${entity.name}" is ${player && player.id ? 'saved' : 'not saved'}.`)
					await DB.inventory.sync(entity)
				}
			}
			// logout all accounts
			await DB.account.logoutAll(false)
			// close databases
			this.socket.close()
			// this.dbPools.forEach(pool => pool.end()) // mariadb
			DB.close()
		} catch (e) {
			console.log('[World] SIGINT signal received. Close all connections and exit. But players was not saved due to an error:', e.message)
		} finally {
			process.exit(0)
		}
	}

	/**
	 * Called when a new WebSocket connection is established.
	 * Validates the token and creates a new EntityControl instance.
	 *
	 * @param {WebSocket} ws - The WebSocket connection
	 * @param {import("http").IncomingMessage} req - The HTTP request
	 */
	async onConnection(ws, req) {
		try {
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
			// const datetime = new Date().toLocaleString();
			const tokenExpires = new Date(payload.exp * 1000).toLocaleString();
			const ip_address = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '');
			console.log(`[World] token verified, from ${ip_address}, account_id:${payload.id}, expires:${tokenExpires}`)

			// token is valid. Next step is to load user data from database
			// Note: find the account with same token
			// account = await this.db.account.login(payload.username, payload.password);
			const account = await DB.account.loginToken(token, ip_address);
			if (!account) {
				console.log('[World] Invalid token, account not found in database.');
				ws.close(4401, 'Invalid credentials');
				return;
			}

			// when multiple logins on the same account
			// send notification and close connection
			const existingPlayer = this.getPlayerByAccount(account.id);
			if (existingPlayer) {
				existingPlayer.control.socket.send(sendChat(
					'default',
					'Security',
					existingPlayer.name,
					'Some one just logged into this account, but you are already logged in.'
				));
				existingPlayer.control.socket.close();
				// await here for a brief moment to save player data
				await new Promise(resolve => setTimeout(resolve, 3000)); // 3s should be enough
			}

			// TODO check if account is banned and other states

			// Authorized, create new player or load existing player
			await createPlayerEntity(this, ws, account)
		} catch (err) {
			console.log('[World] Error', err.message, err.code || '')
			ws.close(4401, 'Invalid credentials')
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
				if (entity.type === TYPE.PLAYER && entity.control.socket.readyState === WebSocket.OPEN) {
					entity.control.socket.send(data, { binary: isBinary });
				}
			}
		}
	}

	/**
	 * Sends a message to all players in the given map.
	 * @param {WorldMap} map
	 * @param {string|Buffer} data
	 * @param {boolean} isBinary
	 */
	broadcastMap(map, data, isBinary = false) {
		for (let entity of map.entities) {
			// Entity with a socket is also Player
			if (entity.type === TYPE.PLAYER && entity.control.socket.readyState === WebSocket.OPEN) {
				entity.control.socket.send(data, { binary: isBinary });
			}
		}
	}

	/**
	 * Returns the number of players currently connected to the world.
	 * @return {Number} The number of players.
	 */
	getPlayerCount() {
		let count = 0
		this.maps.forEach((map) => {
			map.entities.forEach((entity) => {
				if (entity.type === TYPE.PLAYER) {
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
				if (entity.aid === id) return entity
			}
		}
	}

	/**
	 * Prepare a map, load it if necessary, and return it.
	 *
	 * @param {number} mapId - The map ID (default: 1 "Lobby town")
	 * @returns {Promise<WorldMap>} - The map
	 */
	async loadMap(mapId = 1) {
		// check if map exists
		let map = this.maps.find(m => m.id === mapId)
		if (!map) {
			// @ts-ignore create new map from map data
			// map = new WorldMap(this, MAPS.find(m => m.name === mapName) || { name: mapName })
			// this.maps.push(map)
			console.log(`[World] load map '${mapId}' not found.`)
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
		return map
	}

	/**
	 * Changes the map of the given entity to the one with the specified id.
	 * If the map does not exist, it will be loaded.
	 * If the entity is a player, it will be moved to the specified coordinates.
	 * Otherwise, it will be spawned at the default coordinates (0, 0).
	 * @param {Entity} entity - The entity to change the map of.
	 * @param {number} mapId - The id of the map to change to.
	 * @param {number} [x=-1] - The x coordinate to move the entity to.
	 * @param {number} [y=-1] - The y coordinate to move the entity to.
	 * @returns {Promise<WorldMap>} - The map the entity was moved to.
	 */
	async changeMap(entity, mapId, x = -1, y = -1) {
		const map = await this.loadMap(mapId)
		if (map) {
			await addEntityToMap(map, entity, x, y)
		}
		return map
	}

}
