NodeJS Game Server
=======================

This is a test project, for simple game server with WebSocket.

Login view:

![Login](./docs/login_01.jpg)

Game view 1 (NPC's):

![NPCs](./docs/game_01.jpg)

Game view 2 (Monsters):

![Monsters](./docs/game_02.jpg)

Game view 3 (other players):

![Players](./docs/game_03.jpg)

## Prerequisites
 - NodeJS & NPM
 - MariaDB or other database
 - Certificates for SSL (for development, see [./certs/README.md](./certs/README.md) for self-signed certs)

## Install

Start by installing all Node modules.

```sh
npm install
```

Make or edit `.env` file and change web options:
```sh
# Web
PORT=3000
JWT_SECRET=mySecretKey
```

### Database

You need to have or install [MariaDB](https://mariadb.com/downloads/), for the [nodejs connector](https://mariadb.com/kb/en/getting-started-with-the-node-js-connector/) to use it.

Create database and user with privileges to read and write. Examples:
```sql
-- Create database --
CREATE DATABASE myDatabase;

-- Create user --
CREATE USER 'myUser'@localhost IDENTIFIED BY 'myPassword';
CREATE USER 'myUser'@127.0.0.1 IDENTIFIED BY 'myPassword';

-- Grant all privileges --
GRANT ALL PRIVILEGES ON *.* TO 'myUser'@localhost IDENTIFIED BY 'myPassword';
GRANT ALL PRIVILEGES ON *.* TO 'myUser'@127.0.0.1 IDENTIFIED BY 'myPassword';

-- Grant specific privileges --
GRANT create, select, insert, delete, alter, update, drop ON myDatabase.* TO 'myUser'@'localhost' IDENTIFIED BY 'myPassword';
GRANT create, select, insert, delete, alter, update, drop ON myDatabase.* TO 'myUser'@'127.0.0.1' IDENTIFIED BY 'myPassword';

-- Update active privileges and show what were granted --
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'myUser'@localhost;
```

Create `.env` file with database connection options (example):
```sh
# MariaDB
DB_HOST=127.0.0.1
DB_USER=myUser
DB_PASS=myPassword
DB_DATABASE=myDatabase
DB_PORT=3306
DB_CONNECTION_LIMIT=5
DB_SALT=your_unique_salt
```

## Build client app

```sh
npm run build
```

## Start the server

```sh
npm run start
```

## Open browser

On Windows:
```sh
explorer "https://127.0.0.1:3000/"
```
On MacOS:
```sh
open "https://127.0.0.1:3000/"
```


## Development notes

The /client directory has the browser source code and it's build using webpack module.

 - Webpack
   - Installed dependency: `npm install webpack webpack-cli --save-dev`
 - Build
   - Command: `npm run build`
   - This will build all the client source into `/dist` directory.
 - Build watch
   - You can use `npm run watch` for client development.
   - This will watch client file changes and rebuild.
 - HTML template
   - Installed dependency: `npm install --save-dev html-webpack-plugin`
 - Loading CSS files
   - See: https://webpack.js.org/guides/asset-management/
   - **Optional.** When you don't have any CSS to load, skip this.
   - After this, you can import CSS files in js source like this: `import './style.css';`
   - Install dependency: `npm install --save-dev style-loader css-loader`
   - Add webpack.config.js:
```js
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
```

### Client library
 - [Mithril.js](https://mithril.js.org/)
 - TODO Phaser etc.

## To-Do
 - Map dimensions
   - now we only have x, y coordinates
   - plant to make 3D world and ad more coordinates to maps?
 - Client game library
   - make choice choose 2D or 3D?
   - Canvas or DOM sprites if 2D is the choice?
 - Item DB split by types: Weapon, Armor, etc.
   - Plan the itemization?
 - Database PostreSQL or MariaDB (partially done)
   - Plan how big DB are we needing?
   - Small with SQLite?
   - Large with MariaDB or PostgreSQL and how versatile it needs to be etc.
 - Etc.