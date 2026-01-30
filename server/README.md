# NodeJS Game — Server

# Overview
- Server side of the NodeJS game. Provides WebSocket/game logic, REST API endpoints, and persistence.
- Uses Express for HTTP APIs and `ws` for WebSocket communication. Database access via `node:sqlite`.

# Quick start
- Install dependencies, run the server, or run tests:

```bash
npm install
npm run start    # runs `node index.js` (production/startup)
npm run test     # runs Jest tests
```

# Project structure (server)
- index.js — server process entry (bootstraps HTTP/WS servers and loads configuration)
- babel.config.cjs — Babel config for transpilation (if used)
- certs/ — local certificates and notes for TLS during development
- src/
  - server.js — main HTTP/WebSocket handlers
  - World.js — world state and map management
  - actions/ — functions to create/remove entities and other game actions
  - api/ — REST API routes, middleware, login/register handlers
  - control/ — server-side entity controllers (AI, player control, pets)
  - db/ — database access layer and schema helpers
  - events/ — game event routing and packet handling
  - maps/, response/, utils/ — supporting modules
- shared/, data/, enum/, models/, utils/, websocket/ — code shared with client and domain data (items, mobs, models, packet definitions)

# Notes
- Configuration via environment variables (loadable with `dotenv`).
- Development certificates are stored under `certs/` for local TLS testing; change or regenerate as needed.
- Tests use Jest; run `npm run test` from the `server/tests/` folder.
- Entry points: `index.js` (top-level) and `src/server.js` (server internals).


# World class

`World` manages the server's runtime state: the WebSocket server, available maps, player lifecycle and periodic updates.

```mermaid
classDiagram
  World <|-- WorldMap
  class World{
    +WebSocketServer socket
    +Array~WorldMap~ maps
    +Number playersCountTotal
    +Number serverStartTime
    +Boolean isClosing
    +NodeJS.Timeout updateTick
    +constructor(server)
    +onExit()
    +onConnection(ws, req)
    +onTick()
    +broadcast(data, isBinary=false)
    +broadcastMap(map, data, isBinary=false)
    +getPlayerCount(): Number
    +getPlayerByAccount(id)
    +loadMap(mapId)
    +changeMap(entity, mapId, x=-1, y=-1)
  }
  class WorldMap{
    +int id
    +String name
    +World world
    +Number width
    +Number height
    +Boolean isLoaded
    +Boolean isCreated
    +Array entities
    +load()
    +create()
    +findEntitiesInRadius()
    +findMapEntityById()
    +findMapEntityByGid()
  }
  WorldMap <|-- MapLobbyTown: extends WorldMap
  MapLobbyTown <|-- EntityControl
  class MapLobbyTown {
    +int id = 1
    +String name = "Lobby Town"
    +Number width = 2000
    +Number height = 1400
    +Boolean isLoaded
    +Array entities
    +create(): CreateEntities
  }
  WorldMap <|-- MapPlainFields1: extends WorldMap
  class MapPlainFields1{
    +int id = 2
    +String name = "Plain Fields 1"
    +Number width = 1200
    +Number height = 800
    +Boolean isLoaded
    +Array entities
    +create(): CreateEntities
  }
  MapLobbyTown <|-- Entity
  Entity <|-- EntityControl
  class Entity {
    +int id
    +int gid
    +int aid
    +int type
    +String name
    +String lastMap
    +Number lastX
    +Number lastY
    +WorldMap map
    +Number hp
    +Number hpMax
    +Number level
    +Number baseExp
    +Number atk
    +Number def
  }
  World <|-- EntityControl
  class EntityControl {
    +int created
    +Entity entity
    +World world
    +WebSocket socket
    +WorldMap map
    +AI ai
    +move()
    +attack()
    +stopAttack()
    +takeDamage()
    +revive()
    +follow()
    +stopFollow()
    +toSavePosition()
    +syncStats()
    +onTick()
    +onSocketError()
    +onSocketMessage()
    +onSocketClose()
  }
```
