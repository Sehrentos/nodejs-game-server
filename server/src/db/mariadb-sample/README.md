# MariaDB sample (server/src/db/mariadb-sample)

Purpose
-------

This folder contains a small MariaDB wrapper used by the game server to manage connections and run queries.
The main implementation is in `index.js` (exports `Database`) and it relies on the `mariadb` Node.js connector.

Prerequisites
-------------

- MariaDB server (or compatible MySQL server)
- Node.js (12+ recommended)
- The project should have `dotenv` available if you want to use a `.env` file

Install
-------

From the `server` package root install the MariaDB connector:

```bash
cd server
npm install mariadb
```

If your project does not already load environment variables, install `dotenv` as well:

```bash
npm install dotenv
```

Environment variables
---------------------

The `Database` class reads configuration from environment variables. Create a `.env` file in `server/` (or export these in your environment):

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=myUser
DB_PASS=myPassword
DB_DATABASE=myDatabase
DB_CONNECTION_LIMIT=5
DB_TRACE=false
```

Usage example
-------------

Simple example showing how to use the `Database` wrapper exported from `index.js`:

```js
import 'dotenv/config';
import { Database } from './db/mariadb-sample/index.js';

async function main() {
  const db = new Database();
  try {
    const rows = await db.query('SELECT 1 AS ok');
    console.log(rows);
  } finally {
    await db.close();
  }
}

main().catch(console.error);
```

Notes
-----

- The sample `index.js` requires the `mariadb` package (see top of the file comment).
- Tables used by the server are defined in the sibling files `TableAccount.js`, `TablePlayer.js` and `TableInventory.js`.
- This README is informational; database schema/migrations are not provided here — add your own SQL migration scripts as needed.

Reference
---------

- MariaDB Node.js connector docs: https://mariadb.com/docs/connectors/mariadb-connector-nodejs/
