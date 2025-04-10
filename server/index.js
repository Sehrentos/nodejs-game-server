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
