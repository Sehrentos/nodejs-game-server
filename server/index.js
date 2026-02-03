/**
 * This file boots an HTTP server either in a single process or
 * in a clustered multi-process mode based on an environment variable.
 *
 * At the top it imports runtime config from dotenv, the Node cluster
 * and os modules, and a server factory/function from ./src/server.js.
 * It derives useCluster by checking if the environment variable
 * USE_CLUSTER is the literal string "true".
 *
 * If clustering is enabled, the script queries the number of CPU cores
 * with os.cpus().length and uses the cluster API. The primary (master)
 * process logs its PID, forks a worker for each CPU, and listens for
 * worker exits so it can log the death and immediately fork a replacement.
 * Each non-primary (worker) process simply calls server() to start handling requests.
 *
 * If clustering is disabled, the script logs the PID and starts the server
 * in the single running process.
 *
 * Gotchas and future suggestions: Consider limiting or rate‑limiting
 * restarts in the exit handler to avoid tight crash/restart loops,
 * and ensure your server binds correctly in cluster mode
 * (Node will balance incoming connections across workers).
 * You might also prefer a boolean parse for USE_CLUSTER
 * (e.g., checking truthy values) or document that it must
 * be the string "true".
 */
import 'dotenv/config';
import cluster from 'cluster';
import os from 'os';
import { server } from './src/server.js';

const useCluster = process.env.USE_CLUSTER === "true" ? true : false;

// multi core mode
if (useCluster) {
	const numSPUs = os.cpus().length;
	// spread processes on multiple cores
	if (cluster.isPrimary) {
		console.log(`Master process ${process.pid} is running.`);

		for (let i = 0; i < numSPUs; i++) {
			cluster.fork();
		}

		cluster.on('exit', (worker, code, signal) => {
			console.log(`Worker process ${worker.process.pid} died. Restarting...`);
			cluster.fork();
		});
	} else {
		// start server
		server();
	}
} else {
	// single core mode
	console.log(`Process ${process.pid} is running.`);
	server();
}
