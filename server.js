import 'dotenv/config';
import express from 'express';
import https from 'https';
import { readFileSync } from 'fs';
import { World } from './src/World.js';
import api from './src/api/index.js';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;
const SSL_ENABLED = process.env.SSL_ENABLED === 'true' ? true : false;
const SSL_KEY = process.env.SSL_KEY;
const SSL_CERT = process.env.SSL_CERT;

// create a new express app
const app = express();

// create HTTP or HTTPS server
let server;
if (SSL_ENABLED) { // SSL/HTTPS certificates
	server = https.createServer({
		key: readFileSync(SSL_KEY),
		cert: readFileSync(SSL_CERT),
	}, app).listen(PORT, () => {
		console.log(`[Server] Web process ${process.pid} is listening https://${HOST}:${PORT}/`)
	})
}
else {
	server = app.listen(PORT, () => {
		console.log(`[Server] Web process ${process.pid} is listening http://${HOST}:${PORT}/`)
	})
}

// create game websocket server (ws://127.0.0.1:3000/<path>)
const world = new World(server);
console.log('[Server] World created, awaiting connections... pre-loaded maps:', world.maps.length);

// parse incoming requests with JSON payloads
app.use(express.json());

// serve public directory
app.use(express.static('dist'));

// serve all assets
app.use('/assets', express.static('assets'));

// @ts-ignore serve empty favicon.ico
app.get('/favicon.ico', (req, res) => {
	res.writeHead(200, {
		'Content-Type': 'image/x-icon',
		'Cache-control': `public, max-age=${60 * 60 * 12}`, // 12 hour cache
	});
	return res.end();
});

// configure routes
app.use('/api', api);
