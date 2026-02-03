// tool to look into player inventory table
// example: node tools/playerInventory.js 1
import 'dotenv/config';
import db from '../src/db/index.js';

// get cli arguments
const args = process.argv.slice(2);
const ownerId = Number(args[0]);

if (!ownerId) {
	console.log('Usage: node playerInventory.js <owner ID>');
	process.exit(1);
}

try {
	await db.connect();

	const items = await db.inventory.getAll(ownerId);

	console.table(items);
} catch (error) {
	console.error("Failed to look into player inventory", error);
}

// close connection
db.close();
