import WebSocket from 'ws';
import { WorldMap } from './WorldMap.js';
import { Client } from './Client.js';

/**
 * @typedef {import("ws").WebSocketServer} WebSocketServer
 * @typedef {import("http").IncomingMessage} IncomingMessage
 * @typedef {import("http").ServerResponse} ServerResponse
 */

/**
 * @module World
 * @description World class contains the world data, such as maps (GAT), clients, etc.
 */
export class World {
    constructor(socket) {
        /** @type {WebSocketServer} */
        this.socket = socket
        /** @type {Map<string, WorldMap>} */
        this.maps = new Map()

        this.serverStartTime = performance.now()
        this.serverUpdateTime = performance.now()
        this.updateTick = setInterval(this.onTick.bind(this), 1000 / 15) // 1000 / 60

        // event bindings
        this.socket.on('connection', this.onConnection.bind(this))
    }

    /**
     * Join a map (or create it if it doesn't exist), and tell the client to join it
     * @param {Client} client - The client that wants to join the map
     * @param {string} name - The name of the map to join (default: "lobby")
     * @returns {Promise<WorldMap>} - The map that was joined
     */
    async joinMap(client, name = "lobby") {
        let map = this.maps.get(name)
        if (map === undefined) {
            map = new WorldMap(name)
            if (name === "lobby") {
                // Note: lobby does not need to be loaded
                map.isLoaded = true
                map.width = 300
                map.height = 300
            }/* else { // TODO load map data
                await map.load()
            }*/
            this.maps.set(name, map)
            map.onCreate()
        }
        // update client data
        client.map = map
        client.x = Math.round(map.width / 2)
        client.y = Math.round(map.height / 2)
        client.dir = 0
        // Client is also an Entity
        map.entities.set(client.id, client)
        return map
    }

    /**
     * Called when a new WebSocket connection is established
     * @param {WebSocket} ws - The WebSocket connection
     * @param {IncomingMessage} req - The HTTP request
     */
    async onConnection(ws, req) {
        const client = new Client(this, ws, req)
        console.log(`Client ${client.id} connection established.`)
    }

    /**
     * Called every tick, runs the onTick function of all clients in all maps
     * @see Client.onTick
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
        // this.clients.forEach((client) => {
        this.maps.forEach((map) => {
            map.entities.forEach((client) => {
                if (client.socket != null && client.socket.readyState === WebSocket.OPEN) {
                    client.socket.send(data, { binary: isBinary });
                }
            })
        })
    }

    onClientClose(client) {
        console.log(`World ${process.pid} client disconnected.`);
        this.broadcast(JSON.stringify({ type: "leave", name: client.name }));
        // remove client from map
        this.maps.forEach((map) => {
            if (!map.entities.delete(client.id)) {
                console.log(`[WARN]: unable to remove client ${client.id} from map ${map.name}`)
            }
        })
    }
}