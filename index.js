import http from 'http';
import { WebSocketServer } from 'ws';
import { World } from './src/World.js';
import { sendFile } from './src/utils/sendFile.js';

const HOST = '127.0.0.1';
const PORT = 3000;

const server = http.createServer()

server.on('request', (req, res) => {
  const url = new URL(req.url || "/", `https://${req.headers.host || HOST}${req.url}`);

  if (url.pathname === '/favicon.ico') {
    res.writeHead(200, {
      'Content-Type': 'image/x-icon',
      'Cache-control': `public, max-age=${60 * 60 * 12}`, // 12 hour cache
    });
    return res.end();
  }

  if (url.pathname === '/') {
    return sendFile(res, './index.html', false);
  }

  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(`<h1>404 Not Found</h1>`);
})

server.listen(PORT, HOST, () => {
  console.log(`Worker process ${process.pid} is listening http://${HOST}:${PORT}/`)
})

// create WebSocket server
const wss = new WebSocketServer({
  server, // bind to HTTPS server instance.
  // host: '127.0.0.1', // {String} The hostname where to bind the server.
  // port: 5999, // {Number} The port number on which to listen.
  clientTracking: false, // {Boolean} Specifies whether or not to track clients.
  // maxPayload: 104857600, // {Number} The maximum allowed message size in bytes. Defaults to 100 MiB (104857600 bytes).
  skipUTF8Validation: false, // {Boolean} Specifies whether or not to skip UTF-8 validation for text and close messages. Defaults to false. Set to true only if clients are trusted.
  perMessageDeflate: false, // {Boolean|Object} Enable/disable permessage-deflate.
});

// bind game world to WebSocket server
const world = new World(wss);
console.log('World created, awaiting connections... maps:', world.maps.size);
