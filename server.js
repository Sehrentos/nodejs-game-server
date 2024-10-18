import http from 'http';
import { randomBytes } from 'node:crypto';
import { WebSocketServer } from 'ws';
import { World } from './src/World.js';
import { sendFile } from './src/utils/sendFile.js';

const HOST = '127.0.0.1';
const PORT = 3000;

// dummy cache for "valid" tokens
// eg. tokens.set(token, {token:string,expires:number});
const tokens = new Map();

const onSocketError = (err) => console.log('Socket error: ', err.message || err, err.code || '');

// our simple HTTP server
// you should use https for SSL in production
const server = http.createServer();

// Websocket authentication on upgrade request
// This needs to be the first middleware
server.on('upgrade', (request, socket, head) => {
	socket.on('error', onSocketError);
	authenticate(request, (err, token) => {
		if (err || !token) {
			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
			socket.destroy();
			return;
		}
		socket.removeListener('error', onSocketError);
		// continue, the next middleware will be executed
		// the wss will handle the handshake etc.
	});
});

const wss = new WebSocketServer({
	server, // bind to HTTPS server instance.
	// host: '127.0.0.1', // {String} The hostname where to bind the server.
	// port: 5999, // {Number} The port number on which to listen.
	clientTracking: false, // {Boolean} Specifies whether or not to track clients.
	// maxPayload: 104857600, // {Number} The maximum allowed message size in bytes. Defaults to 100 MiB (104857600 bytes).
	skipUTF8Validation: false, // {Boolean} Specifies whether or not to skip UTF-8 validation for text and close messages. Defaults to false. Set to true only if clients are trusted.
	perMessageDeflate: false, // {Boolean|Object} Enable/disable permessage-deflate.
});

// bind game to WebSocket server
const world = new World(wss);
console.log('World created, awaiting connections... maps:', world.maps.size);

/**
 * Authenticates a WebSocket connection by checking the `Authorization` header
 * for a Bearer token.
 *
 * @param {http.IncomingMessage} request - The incoming HTTP request.
 * @param {Function} next - The callback function to call with either an
 *   `Error` object or `null` and the `String` token.
 * @throws {Error} If the `Authorization` header is missing or invalid.
 */
const authenticate = (request, next) => {
	// get Bearer token from Sec-WebSocket-Protocol header
	// const { authorization } = request.headers;
	const authorization = request.headers['sec-websocket-protocol'];
	//="ws, wss, Bearer.123"
	if (!authorization) {
		return next(new Error('Unauthorized'));
	}
	const token = authorization.split(' ').find(part => part.startsWith('Bearer.')).split('.')[1];
	if (!token) {
		return next(new Error('Unauthorized'));
	}
	// find and validate token
	if (!tokens.get(token)) {
		return next(new Error('Unauthorized'));
	}
	return next(null, token);
};

server.on('request', (req, res) => {
	const url = new URL(req.url || "/", `https://${req.headers.host || HOST}${req.url}`);
	res.removeHeader('x-powered-by');

	if (url.pathname === '/favicon.ico') {
		res.writeHead(200, {
			'Content-Type': 'image/x-icon',
			'Cache-control': `public, max-age=${60 * 60 * 12}`, // 12 hour cache
		});
		return res.end();
	}

	// serve index.html
	if (url.pathname === '/') {
		return sendFile(res, './dist/index.html', false);
	}
	// serve bundle.js
	if (url.pathname === '/bundle.js') {
		return sendFile(res, './dist/bundle.js', false);
	}

	// user authentication with POST request
	// it will validate username and password
	// then it will create a Bearer token for the user
	// user can use this token to connect to the wss server,
	// by setting `sec-websocket-protocol: ws, wss, Bearer.123` in the request header
	// POST /login
	// { "username": "...", "password": "..." }
	if (url.pathname === '/login' && req.method === 'POST') {
		// read post data as buffer chunks
		let chunks = [];
		req.on('data', chunk => chunks.push(chunk));
		req.on('end', () => {
			const data = Buffer.concat(chunks);
			chunks = null;
			try { // parse the chunks as JSON
				const json = JSON.parse(data.toString());
				// TODO database to authenticate
				// below is just for demo purpose
				if (json.username && json.password) {
					// generate JWT token
					const accessToken = {
						token: randomBytes(16).toString('hex'), // TODO real JWT token, with user data in it
						expires: Date.now() + 1000 * 60 * 15, // 15 minutes
					};
					// save to dummy cache
					tokens.set(accessToken.token, accessToken);
					const response = JSON.stringify(accessToken);
					res.writeHead(200, {
						'cache-control': 'no-cache',
						'expires': '-1',
						'pragma': 'no-cache',
						// CORS
						// 'access-control-allow-headers': '*',
						// 'access-control-allow-credentials': 'true',
						// 'access-control-allow-methods': '*',
						// 'access-control-allow-origin': '*',
						'content-length': Buffer.byteLength(response),
						'content-type': 'application/json',
					});
					return res.end(response);
				}
			} catch (e) {
				// ignore
			}
			const response = JSON.stringify({ error: 'Unauthorized' });
			res.writeHead(401, {
				'cache-control': 'no-cache',
				'expires': '-1',
				'pragma': 'no-cache',
				// CORS
				// 'access-control-allow-headers': '*',
				// 'access-control-allow-credentials': 'true',
				// 'access-control-allow-methods': '*',
				// 'access-control-allow-origin': '*',
				'content-length': Buffer.byteLength(response),
				'Content-Type': 'application/json',
			});
			return res.end(response);
		});
		return;
	}

	// Not found
	res.writeHead(404, { 'Content-Type': 'text/html' });
	res.end(`<h1>404 Not Found</h1>`);
})

server.listen(PORT, HOST, () => {
	console.log(`Worker process ${process.pid} is listening http://${HOST}:${PORT}/`)
})
