// tool to drop all tables and recreate the database
// example: node tools/dropTables.js
import db, { dropAccountTable, dropInventoryTable, dropPlayerTable } from '../index.js';

// using factory adapter instance `db`

try {
	console.log("drop all tables...");
	await dropPlayerTable();
	await dropInventoryTable();
	await dropAccountTable();

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
