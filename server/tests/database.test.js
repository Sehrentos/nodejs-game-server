import 'dotenv/config';
import { TYPE } from '../../shared/enum/Entity.js';
import { Account } from '../../shared/models/Account.js';
import { Entity } from '../../shared/models/Entity.js';
import { Item } from '../../shared/models/Item.js';
import db from '../src/db/index.js';

// usage: node tests/database.test.js

(async () => {
	console.log('describe: database test')

	let res;
	let account;
	let playerId;
	const username = `test_user_${Date.now()}`;
	const password = 'password123';

	console.log('beforeAll');
	await db.connect();

	console.log('account add and login');
	const addRes = await db.account.add(new Account({
		username,
		password,
		email: `${username}@example.test`,
		last_ip: '127.0.0.1',
	}));
	console.log('Expect to be defined:', addRes !== undefined);

	account = await db.account.login(username, password);
	console.log('Expect to be InstanceOf Account:', account instanceof Account);
	console.log('Expect to be equal:', account.username == username);

	console.log('player add');
	const player = new Entity({
		type: TYPE.PLAYER,
		aid: account.id,
		gid: `gid_${Date.now()}`,
		spriteId: 1,
		name: `Player_${Date.now()}`,
		saveMap: 1,
		saveX: 10,
		saveY: 10,
	});
	res = await db.player.add(player);
	console.log('Expect to be defined:', res !== undefined);
	console.log('Expect to be truthy:', res.id || res.id === 0);
	playerId = res.id || (res.id === 0 ? 0 : undefined);


	console.log('inventory add');
	const item = new Item({ id: 9999, amount: 1, slot: 1, isEquipped: false });
	res = await db.inventory.add(playerId, item);
	console.log('Expect to be defined:', res !== undefined);
	console.log('Expect to be truthy:', res.id && (res.id || res.id === 9999));

	console.log('inventory getItems');
	res = await db.inventory.getAll(playerId);
	console.log('Expect to be defined:', res !== undefined);
	console.log('Expect to be true:', Array.isArray(res));
	console.log('Expect to be greater than 0:', res.length > 0);
	console.log('Expect to be equal:', res[0].id === 9999);

	console.log('afterAll');
	try {
		if (playerId) await db.player.delete(playerId);
		if (account?.id) await db.account.delete(account.id);
		await db.inventory.clear(playerId);
	} catch (e) {
		// ignore cleanup errors
	}

	await db.close();
})();
