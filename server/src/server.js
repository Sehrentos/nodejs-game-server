import 'dotenv/config';
import express from 'express';
import https from 'https';
import { readFileSync } from 'fs';
import { World } from './World.js';
import api from './api/index.js';

export function server() {
	const HOST = process.env.HOST || '127.0.0.1';
	const PORT = Number(process.env.PORT) || 3000;
	const SSL_ENABLED = process.env.SSL_ENABLED === 'true' ? true : false;
	const SSL_KEY = process.env.SSL_KEY;
	const SSL_CERT = process.env.SSL_CERT;

	// create a new express app
	const app = express();

	// create HTTP or HTTPS server
	let srv;
	if (SSL_ENABLED) { // SSL/HTTPS certificates
		srv = https.createServer({
			key: readFileSync(SSL_KEY),
			cert: readFileSync(SSL_CERT),
		}, app).listen(PORT, () => {
			console.log(`[Server] Web process ${process.pid} is listening https://${HOST}:${PORT}/`)
		})
	}
	else {
		srv = app.listen(PORT, () => {
			console.log(`[Server] Web process ${process.pid} is listening http://${HOST}:${PORT}/`)
		})
	}

	// create game websocket server (ws://127.0.0.1:3000/<path>)
	const world = new World(srv);
	console.log('[Server] World created, awaiting connections... pre-loaded maps:', world.maps.length);

	// parse incoming requests with JSON payloads
	app.use(express.json());

	// serve public directory
	app.use(express.static('../client/dist'));

	// serve all assets
	// and cache them for 1 week and make immutable, to prevents unnecessary revalidation during reloads
	app.use('/assets', express.static('../assets', { immutable: true, maxAge: 60 * 60 * 24 * 7 }));

	// @ts-ignore serve empty favicon.ico
	app.get('/favicon.ico', (req, res) => {
		res.writeHead(200, {
			'Content-Type': 'image/x-icon',
			// 12 hour cache
			// 'Cache-control': `public, max-age=${60 * 60 * 12}`,
			// 1 week cache
			'Cache-control': `public, max-age=${60 * 60 * 24 * 7}, immutable`,
		});
		return res.end();
	});

	// configure routes
	app.use('/api', api);
}
