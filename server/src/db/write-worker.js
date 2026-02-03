import 'dotenv/config';
import { parentPort } from 'worker_threads';
import DatabaseSync from 'better-sqlite3';
// import { DatabaseSync } from 'node:sqlite';

const MAX_RETRIES = 5;

// Initialize the database connection
const db = new DatabaseSync(process.env.SQLITE_FILE || 'app_data.db');
db.pragma('journal_mode = WAL');

// Optional: High-performance settings
// The synchronous = NORMAL pragma tells SQLite to not wait
// for the hard drive to physically spin/flush for every
// single write, which is safe in WAL mode and
// drastically increases throughput.
//db.pragma('synchronous = NORMAL');
// Store temporary tables and indices in memory for speed
//db.pragma('temp_store = MEMORY');

//console.log(`Current mode: ${db.pragma('journal_mode', { simple: true })}`);

/**
 * A simple queue to manage incoming database write requests
 * @type {Array<{id:string, action:"run"|"get"|"all", query:string, params:Array}>}
 */
const queue = [];
let isProcessing = false;

// Helper to sleep/pause
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// The "Worker" engine
async function processQueue() {
	if (isProcessing || queue.length === 0) return;

	isProcessing = true;
	const { id, action, query, params } = queue.shift();

	try {
		const result = await executeWithRetry(action, query, params);
		parentPort.postMessage({ id, status: 'success', data: result });
	} catch (err) {
		parentPort.postMessage({ id, status: 'error', error: err.message });
	}

	isProcessing = false;
	// Process next in queue
	processQueue();
}

/**
 * Executes a database action with retry logic for busy/locked errors.
 * @param {"run"|"get"|"all"} action
 * @param {*} query
 * @param {*} params
 * @returns
 */
async function executeWithRetry(action, query, params) {
	let attempt = 0;

	while (attempt < MAX_RETRIES) {
		try {
			// check when params is array of arrays for batch
			if (Array.isArray(params) && Array.isArray(params[0])) {
				const stmt = db.prepare(query);
				// better-sqlite3:
				const insertMany = db.transaction((rows) => {
					for (const paramSet of rows) {
						stmt[action](...paramSet);
					}
				});
				return insertMany(params);
				// node:sqlite:
				// const results = [];
				// for (const paramSet of params) {
				// 	results.push(stmt[action](...paramSet));
				// }
				// return results;
			}
			// Single query
			return db.prepare(query)[action](...params);
		} catch (err) {
			if (err.code === 'SQLITE_BUSY' || err.message.includes('locked')) {
				attempt++;
				// Wait longer each time: 50ms, 100ms, 200ms...
				await sleep(Math.pow(2, attempt) * 25);
				continue;
			}
			throw err; // If it's a syntax error, don't retry
		}
	}
	throw new Error(`Failed after ${MAX_RETRIES} retries: Database is busy.`);
}

// Listen for tasks from the main thread
parentPort.on('message', (task) => {
	// console.log('[WriteWorker] Received task:', task);
	queue.push(task);
	processQueue();
});

// Clean up on exit
parentPort.on('exit', () => {
	db.close();
});

// without queue processing
// parentPort.on('message', async ({ id, query, params }) => {
// 	try {
// 		const result = await executeWithRetry(query, params);
// 		parentPort.postMessage({ id, status: 'success', data: result });
// 	} catch (err) {
// 		parentPort.postMessage({ id, status: 'error', error: err.message });
// 	}
// });
