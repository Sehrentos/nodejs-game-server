# SQLite database (server/src/db)

Purpose
-------

This folder implements a small SQLite database wrapper used by the game server.
The implementation lives in `index.js` and exports a singleton `Database` instance built on `better-sqlite3`.

Prerequisites
-------------

- Node.js (12+ recommended)
- `better-sqlite3` Node package (native addon)

Install
-------

From the `server` package root install the SQLite driver:

```bash
cd server
npm install better-sqlite3
```

Note: `better-sqlite3` is a native addon and may require native build tools on Windows (Visual Studio Build Tools).

Configuration
-------------

The wrapper reads the SQLite file path from the `SQLITE_FILE` environment variable. Default is `./database.sqlite`.

Example `.env` (place in `server/`):

```
SQLITE_FILE=./data/database.sqlite
```

API and usage
-------------

The `Database` class exposes convenience methods you can use from server code:

- `connect()` — connects to the database and creates tables.
- `close()` — closes the database.
- `get(query, params)` — executes a prepared READ statement and returns the first result as an object.
- `all(query, params)` — executes a prepared READ statement and returns all results as an array of objects.
- `query(action, query, params)` — executes a prepared WRITE statement in worker.

Simple usage example (ES module):

```js
import 'dotenv/config';
import db from './db/index.js';

async function main() {
  const items = await db.inventory.getAll(1);
  console.log(items);
  await db.close();
}

main().catch(console.error);
```

Implementation notes
--------------------

- The wrapper uses `better-sqlite3` and sets `PRAGMA journal_mode = WAL` for improved concurrency.
- `index.js` provides a singleton as the default export.
- Table-specific logic is implemented in the sibling modules: `TableAccount.js`, `TablePlayer.js`, and `TableInventory.js`.

References
----------

- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
