// tool to look into player inventory table
// example: node tools/playerInventory.js 1
import { Database } from "../src/db/mariadb/Database.js";

// get cli arguments
const args = process.argv.slice(2);
const ownerId = Number(args[0]);

if (!ownerId) {
	console.log('Usage: node playerInventory.js <owner ID>');
	process.exit(1);
}

// create connection to database
const db = new Database();

try {
	// const res = await db.query("SELECT * FROM inventory WHERE _owner = ?", [ownerId]);
	const items = await db.inventory.getItems(ownerId);
	console.table(items);
} catch (error) {
	console.error("Failed to look into player inventory", error);
}

// close connection
db.close();
