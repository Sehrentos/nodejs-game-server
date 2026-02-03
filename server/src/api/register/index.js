import express from 'express';
import { generateToken } from '../../utils/jwt.js';
import DB from '../../db/index.js';
import { Account } from '../../../../shared/models/Account.js';
const router = express.Router({ caseSensitive: false });

// route /api/register
router.post('/', async (req, res, next) => {
	const { username, password, email } = req.body;
	let last_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
	last_ip = Array.isArray(last_ip) ? last_ip[0] : last_ip;

	// check if username and password are provided
	if (!username || !password) {
		res.status(401);
		res.json({ type: 'error', message: 'Unauthorized' });
		return;
	}

	/** @type {Account} */
	let account, response;
	try {
		await DB.connect()

		// register new account
		// duplicate error.code: 'ER_DUP_ENTRY', when run again
		response = await DB.account.add({
			username,
			password,
			email,
			last_ip,
		});
		console.log('[API/register] account registered:', response)

		// do login with the new account
		account = await DB.account.login(username, password, last_ip);
		console.log('[API/register] account logged in:', account.id)

		// generate JWT token, but filter some account props
		const token = generateToken({
			id: account.id, // this should be enough to identify the user later
			email: account.email,
			state: account.state,
			expires: account.expires,
			logincount: account.logincount,
			lastlogin: account.lastlogin,
			last_ip: account.last_ip,
		})

		// update web token in database
		response = await DB.account.setToken(account.id, token);
		console.log('[API/register] account register completed:', response)

		res.json({
			type: 'success',
			message: 'JWT token',
			token
		});
	} catch (err) {
		console.log('[API/register] Error', err.message, err.code || '')
		res.status(401);
		res.json({ type: 'error', message: `Register failed. Code: ${err.code || '-1'}` });
	}
});

export default router;
