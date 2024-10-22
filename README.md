NodeJS Game Server
=======================

This is a test project, for simple game server with WebSocket.

## Prerequisites
 - NodeJS & NPM
 - MariaDB or other database
 - Certificates for SSL (see [./certs/README.md](./certs/README.md) for self-signed certs notes for development)

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

```sh
open http://127.0.0.1:3000/
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
 - [Mithril.js](https://mithril.js.org/) or [VanJS](https://vanjs.org/)
 - Let's use VanJS for now. Good opportunity to test it.
   - Installed dependency: `npm install vanjs-core` in https://vanjs.org/start

## To-Do
 - Proper map dimensions, now we only have x, y coordinates
 - Client game library
 - Item DB split by types: Weapon, Armor, etc.
 - Database PostreSQL or MariaDB (partially done)