// the API middlewares

/**
 * Creates a rate limiting middleware for Express.js.
 * 
 * The rate limiting works by tracking the timestamp of the last request
 * for each IP address. If the difference between the current timestamp
 * and the last request timestamp is less than the rate limit window,
 * the middleware returns a 429 status code with a message saying
 * "Too many requests". Otherwise, the middleware updates the timestamp
 * for the IP address and calls the next function.
 * 
 * The rate limit window is configurable and defaults to 1000 ms (1 second).
 * The Map is cleaned up periodically to remove entries older than the
 * rate limit window * 2.
 * 
 * @param {Object} options - An object with an optional `rateLimitWindow` property.
 * @param {number} [options.rateLimitWindow=1000] - The rate limit window in milliseconds.
 * 
 * @returns {import('express').RequestHandler} - The rate limiting middleware.
 */
export function createRateLimitter(options = { rateLimitWindow: 1000 }) {
	const rateLimitWindow = options.rateLimitWindow; // 1 second

	/** @type {Map<string, number>} - Map to store IP addresses and timestamps */
	const rateLimitMap = new Map();

	/**
	 * Rate limit middleware
	 * 
	 * @param {import('express').Request} req - The Express.js request object.
	 * @param {import('express').Response} res - The Express.js response object.
	 * @param {import('express').NextFunction} next - The Express.js next function.
	 * @type {import('express').RequestHandler}
	 */
	return (req, res, next) => {
		const ip = req.ip;

		const now = Date.now();

		// Check if the IP exists and if it's within the rate limit
		if (rateLimitMap.has(ip)) {
			const lastRequestTime = rateLimitMap.get(ip);
			if (now - lastRequestTime < rateLimitWindow) {
				// TODO log users ip and time and API endpoint, for later analysis
				res.status(429).json({ type: 'error', message: 'Too many requests' });
				// res.status(429).send('Too many requests');
				// or next(Error('Too many requests'));
				return;
			}
		}

		// Update or add the IP to the Map
		rateLimitMap.set(ip, now);

		// Clean up the Map periodically (e.g., using a timer or background job)
		// Remove entries older than the rate limit window * 2
		rateLimitMap.forEach((timestamp, ip) => {
			if (now - timestamp > rateLimitWindow * 2) {
				rateLimitMap.delete(ip);
			}
		});

		next();
	};
}

// export function rateLimit(req, res, next) {
// 	const ip = req.ip;
// 	const rateLimitWindow = 1000; // 1 second
// 	const maxRequestsPerWindow = 5;

// 	// Map to store IP addresses and timestamps
// 	const rateLimitMap = new Map();

// 	const now = Date.now();

// 	// Check if the IP exists in the Map
// 	if (rateLimitMap.has(ip)) {
// 		const [lastRequestTime, requestCount] = rateLimitMap.get(ip);

// 		// Check if the request count exceeds the maximum allowed
// 		if (requestCount >= maxRequestsPerWindow) {
// 			return res.status(429).send('Too many requests');
// 		}

// 		// Check if it's within the rate limit window
// 		if (now - lastRequestTime < rateLimitWindow) {
// 			return res.status(429).send('Too many requests');
// 		}

// 		// Update the timestamp and increment the request count
// 		rateLimitMap.set(ip, [now, requestCount + 1]);
// 	} else {
// 		// Add the IP to the Map with an initial request count of 1
// 		rateLimitMap.set(ip, [now, 1]);
// 	}

// 	// Clean up the Map periodically (e.g., using a timer or background job)
// 	// Remove entries older than the rate limit window * 2
// 	rateLimitMap.forEach((value, key) => {
// 		const [timestamp, requestCount] = value;
// 		if (now - timestamp > rateLimitWindow * 2) {
// 			rateLimitMap.delete(key);
// 		}
// 	});

// 	next();
// }