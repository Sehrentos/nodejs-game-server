// tool to create a new account
// example: node tools/createAccount.js john_doe password123 johndoe@example.com
import { Account } from "../../shared/models/Account.js";
import { Database } from "../src/db/Database.js";

// get cli arguments
const args = process.argv.slice(2);
const username = args[0];
const password = args[1];
const email = args[2];
const last_ip = args[3] || '127.0.0.1';

if (!username || !password || !email) {
	console.log('Usage: node createAccount.js <username> <password> <email> <last_ip (optional)>');
	process.exit(1);
}

// create connection to database
const db = new Database();

try {
	// check if account already exists
	const queryResultExist = await db.query("SELECT username FROM account WHERE username = ?", [username]);
	// OK: [ { username: 'john_doe' } ]
	if (queryResultExist.length > 0) {
		console.log('Account already exists:', queryResultExist);
		process.exit(1);
	}

	// add new account
	const queryResultInsert = await db.account.add(new Account({
		username,
		password,
		email,
		last_ip,
	}));
	console.log('Added result:', queryResultInsert)

	// test login
	const account = await db.account.login(username, password, last_ip);
	console.log('Test login:', account)

} catch (err) {
	console.log(err);
}

db.close();
