// tool to drop all tables and recreate the database
// example: node tools/dropTables.js
import { Database } from "../Database.js";

// create connection to database
const db = new Database();

try {
	console.log("drop all tables...");
	await db.player.drop();
	await db.inventory.drop();
	await db.account.drop();

	console.log("create the tables...");
	await db.player.create();
	await db.inventory.create();
	await db.account.create();

	console.log("success.");

} catch (error) {
	console.error("Failed to recreate tables", error);
}

// close connection
db.close();
