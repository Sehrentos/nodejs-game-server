import { TYPE } from '../../../shared/enum/Entity.js';
import { Account } from '../../../shared/models/Account.js';
import { Entity } from '../../../shared/models/Entity.js';
import { Item } from '../../../shared/models/Item.js';
import db from '../../src/db/index.js';

describe('DB adapter (generic)', () => {
	let account;
	let playerId;
	const username = `test_user_${Date.now()}`;
	const password = 'password123';

	beforeAll(async () => {
		await db.connect();
	});

	afterAll(async () => {
		try {
			if (playerId) await db.player.delete(playerId);
			if (account?.id) await db.account.delete(account.id);
			await db.inventory.clear(account?.id ?? 0);
		} catch (e) {
			// ignore cleanup errors
		}
		await db.close();
	});

	test('account add and login', async () => {
		const addRes = await db.account.add(new Account({
			username,
			password,
			email: `${username}@example.test`,
			last_ip: '127.0.0.1',
		}));
		expect(addRes).toBeDefined();

		account = await db.account.login(username, password);
		expect(account).toBeInstanceOf(Account);
		expect(account.username).toBe(username);
	});

	test('player add', async () => {
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
		const res = await db.player.add(player);
		expect(res).toBeDefined();
		expect(res.id || res.id === 0).toBeTruthy();
		playerId = res.id || (res.id === 0 ? 0 : undefined);
	});

	test('inventory add', async () => {
		const item = new Item({ id: 9999, amount: 1, slot: 1, isEquipped: false });
		const res = await db.inventory.add(account.id, item);
		expect(res).toBeDefined();
		expect(res.id || res.id === 9999).toBeTruthy();
	});

	test('inventory getItems', async () => {
		const items = await db.inventory.getAll(account.id);
		expect(items).toBeDefined();
		expect(Array.isArray(items)).toBe(true);
		expect(items.length).toBeGreaterThan(0);
		expect(items[0].id).toBe(9999);
	});
});
