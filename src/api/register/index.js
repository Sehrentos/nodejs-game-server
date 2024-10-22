import express from 'express';
import { generateToken } from '../../utils/jwt.js';
import { WebDB } from '../web-db-connection.js';
import { Account } from '../../db/Account.js';
const router = express.Router({ caseSensitive: false });

// route /api/register
router.post('/', async (req, res, next) => {
    const { username, password, email } = req.body;
    const last_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // check if username and password are provided
    if (!username || !password) {
        res.status(401);
        res.json({ type: 'error', message: 'Unauthorized' });
        return;
    }

    // load user data from database
    let conn, account;
    try {
        conn = await WebDB.connect()

        // register new account
        // duplicate error.code: 'ER_DUP_ENTRY', when run again
        let newAccount = await WebDB.account.add(new Account({
            username,
            password,
            email,
            last_ip: Array.isArray(last_ip) ? last_ip[0] : last_ip,
        }));
        if (!newAccount) {
            throw Error('Invalid register credentials');
        }
        console.log('[DB#register] account registered:', newAccount.insertId)

        // do login with the new account
        account = await WebDB.account.login(username, password);
        if (!account) {
            throw Error('Invalid login credentials');
        }
        console.log('[DB#register] account logged in:', account.id)

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
        await WebDB.account.updateToken(account.id, token);
        console.log('[DB#register] account register completed:', account.id)

        res.json({
            type: 'success',
            message: 'JWT token',
            token
        });
    } catch (err) {
        console.log('[DB#register] Error', err.message, err.code || '')
        res.status(401);
        res.json({ type: 'error', message: 'Invalid credentials' });
    } finally {
        if (conn) conn.end();
    }
});

export default router;