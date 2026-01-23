import { TYPE } from "../../../../shared/enum/Entity.js";
import { Account } from "../../../../shared/models/Account.js";
import { Entity } from "../../../../shared/models/Entity.js";
import { Item } from "../../../../shared/models/Item.js";
import { Database } from "./Database.js";

let totalTests = 3;
let passedTests = 0;

// test Database class
// node .\src\db\sqlite\database.test.js
(async () => {

	const db = new Database();

	// test account creation and login
	try {
		const res = db.query("SELECT username from account");
		console.log('query:', res);
		// SqliteError: UNIQUE constraint failed: account.username
		// = username already exists
		const addAccount = await db.account.add(new Account({
			username: 'john_doe',
			password: 'password123',
			email: 'johndoe@example.com',
			last_ip: '127.0.0.1',
		}));
		console.log('add account:', addAccount)

		const account = await db.account.login('john_doe', 'password123');
		console.log('account login:', account)
		passedTests++;

	} catch (err) {
		console.log('Account error:', err);
	}

	// test player creation
	try {
		const addPlayer = await db.player.add(new Entity({
			type: TYPE.PLAYER,
			aid: 1,
			gid: 'c2a126669331a55b97ea728fc4b273f7',
			spriteId: 1,
			name: 'John Doe',
			saveMap: 1,
			saveX: 875,
			saveY: 830,
			speed: 20,
			hpRecovery: 10,
		}));
		console.log('add player:', addPlayer);
		passedTests++;
	} catch (err) {
		console.log('Player error:', err);
	}

	// test inventory addition
	try {
		const addItem = await db.inventory.add(1, new Item({
			id: 1,
			amount: 1,
			slot: 1,
			isEquipped: false,
		}));
		console.log('add item:', addItem);
		passedTests++;
	} catch (err) {
		console.log('Inventory error:', err);
	}

	db.close();

	console.log(`[DB test]: Passed ${passedTests} out of ${totalTests} tests.`);

})();
