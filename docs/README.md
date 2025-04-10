# Docs

TODO
 - add some guides how things work around here...
 - explain how to create maps, entity textures and how to use them.
 - explain how the login / register flow works
 - Server side docs
 - Client side docs

Sample diagram:
```mermaid
classDiagram
  World <|-- WorldMap
  class World{
    +WebSocketServer socket
    +Database db
    +Array dbPools
    +Array maps
    +int playersTotalCount
    +int serverStartTime
    +Boolean isClosing = false
    +int updateTick->setInterval->onTick
    +broadcast()
    +joinMap()
    +getPlayersCount(): Online
    +addEntityToMap()
    +removeEntityFromMap()
    +onTick()
    +onExit()
    +onConnection()
    +onClientClose()
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
    +Boolean isLoaded = true
    +Array entities
    +create(): CreateEntities
  }
  WorldMap <|-- MapPlainFields1: extends WorldMap
  class MapPlainFields1{
    +int id = 2
    +String name = "Plain Fields 1"
    +Number width = 1200
    +Number height = 800
    +Boolean isLoaded = true
    +Array entities
    +create(): CreateEntities
  }
  MapLobbyTown <|-- Entity
  Entity <|-- EntityControl
  class Entity {
    +int id
    +int gid
    +int aid =
    +int type = ENTITY_TYPE.PLAYER
    +String name = "Player-1"
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
