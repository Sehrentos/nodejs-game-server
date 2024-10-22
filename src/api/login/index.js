import express from 'express';
import { generateToken } from '../../utils/jwt.js';
import { WebDB } from '../web-db-connection.js';
const loginRouter = express.Router({ caseSensitive: false });

// route /api/login
loginRouter.post('/', async (req, res, next) => {
    const { username, password } = req.body;
    let last_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    last_ip = Array.isArray(last_ip) ? last_ip[0] : last_ip;

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

        account = await WebDB.account.login(username, password, last_ip);
        if (!account) {
            throw Error('Invalid credentials');
        }

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
        console.log('[DB#login] account login:', account.id)

        res.json({
            type: 'success',
            message: 'JWT token',
            token
        });
    } catch (err) {
        console.log('[DB#login] Error', err.message, err.code || '')
        res.status(401);
        res.json({ type: 'error', message: 'Invalid credentials' });
    } finally {
        if (conn) conn.end();
    }
});

export default loginRouter;