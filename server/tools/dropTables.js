// tool to drop all tables and recreate the database
// example: node tools/dropTables.js
import db from '../src/db/index.js';

try {
	await db.connect();

	console.log("drop all tables...");

	await db.account.drop();
	await db.inventory.drop();
	await db.player.drop();

	// TODO missing table create calls
	// console.log("create the tables...");
	// await db.player.create();
	// await db.inventory.create();
	// await db.account.create();

	console.log("success.");

} catch (error) {
	console.error("Failed to recreate tables", error);
}

// close connection
db.close();
