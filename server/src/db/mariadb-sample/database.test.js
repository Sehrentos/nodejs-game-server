import { Account } from '../../../../shared/models/Account.js';
import { Database } from './index.js';

const isMaria = process.env.DB_DRIVER === 'mariadb';
const describeIf = isMaria ? describe : describe.skip;

describeIf('DB adapter (mariadb)', () => {
	let account;
	const db = new Database();
	const username = `test_user_${Date.now()}`;
	const password = 'password123';

	beforeAll(async () => {
		await db.connect();
	});

	afterAll(async () => {
		try {
			if (account?.id) await db.account.delete(account.id);
			await db.inventory.clear(account?.id ?? 0);
		} catch (e) { }
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
});
