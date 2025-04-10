import express from 'express';
import { generateToken, verifyToken } from '../../utils/jwt.js';
import { DB } from '../../db/index.js';
import jwt from 'jsonwebtoken';
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
    let conn;
    try {
        conn = await DB.connect()

        const account = await DB.account.login(username, password, last_ip);

        // generate JWT token, but filter some account props
        const token = generateToken({
            id: account.id, // this should be enough to identify the user later
            email: account.email,
            state: account.state,
            expires: account.expires,
            logincount: account.logincount,
            lastlogin: account.lastlogin,
            last_ip: account.last_ip,
        }, process.env.JWT_EXPIRES || "2d")

        // update web token in database
        await DB.account.updateToken(account.id, token);
        console.log('[API/login] account login:', account.id)

        res.json({
            type: 'success',
            message: 'JWT token',
            token
        });
    } catch (err) {
        console.log('[API/login] Error', err.message, err.code || '')
        res.status(401);
        res.json({ type: 'error', message: 'Invalid credentials' });
    } finally {
        if (conn) conn.end();
    }
});

// route /api/login/token
loginRouter.post('/token', async (req, res, next) => {
    const { token } = req.body;

    // check if token exists
    if (!token) {
        res.status(401);
        res.json({ type: 'error', message: 'Unauthorized' });
        return;
    }


    try {
        // verify/refresh token
        await verifyToken(token);
        // const payload = await verifyToken(token);
        // console.log(`[API/login/token] is verified`, payload);
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401);
            res.json({ type: 'error', message: `Token expired: ${err.expiredAt}` });
            return
        }
        console.log('[API/login/token] verify error:', err.message, err.code || '')
        res.status(401);
        res.json({ type: 'error', message: 'Token unverified' });
        return;
    }

    // load user data from database
    let conn;
    try {
        conn = await DB.connect()

        // get account data with old token
        const account = await DB.account.loginToken(token);

        // generate JWT token, but filter some account props
        const jwtToken = generateToken({
            id: account.id, // this should be enough to identify the user later
            email: account.email,
            state: account.state,
            expires: account.expires,
            logincount: account.logincount,
            lastlogin: account.lastlogin,
            last_ip: account.last_ip,
        }, process.env.JWT_EXPIRES || "2d")

        // update new web token in database
        await DB.account.updateToken(account.id, jwtToken);
        console.log('[API/login/token] account login:', account.id)

        res.json({
            type: 'success',
            message: 'JWT token',
            token: jwtToken
        });
    } catch (err) {
        console.log('[API/login/token] Error', err.message, err.code || '')
        res.status(401);
        res.json({ type: 'error', message: 'Invalid token' });
    } finally {
        if (conn) conn.end();
    }
});

export default loginRouter;