/**
 * Helper to limit WebSocket messages.
 * - set rate limiter value in ms.
 * - set short burst limit and window in ms.
 */
export default class RateLimiter {
    /**
     * Constructs a new RateLimiter instance.
     *
     * @param {number} rateLimit - The rate limit in milliseconds. Defaults to 100ms if not provided.
     * @param {number} burstLimit - The maximum number of messages allowed in a burst. Defaults to 5 if not provided.
     * @param {number} burstWindow - The time window for a burst in milliseconds. Defaults to 1000ms (1 second) if not provided.
     */
    constructor(rateLimit, burstLimit, burstWindow) {
        this.rateLimit = rateLimit || 100; // Default rate limit of 100ms
        this.burstLimit = burstLimit || 5;    // Default burst limit of 5
        this.burstWindow = burstWindow || 1000; // Default burst window of 1000ms (1 second)
        this.lastMessageTime = 0;
        this.messageCount = 0;
    }

    /**
     * Limits the execution of a callback function based on rate and burst settings.
     *
     * This function checks the time since the last message and the message count
     * against the predefined rate limit and burst limit settings. If the rate limit
     * is exceeded and the message count is at or above the burst limit, the callback
     * will not be executed. If the burst window has passed, the message count is reset.
     * If not rate limited, the callback is executed.
     *
     * @param {Function} [callback] - optional. The callback function to execute if the rate limit allows.
     *
     * @returns {boolean} - Returns true if the callback was executed, false if rate limited.
     */
    limit(callback) { // Pass a callback function to execute if not rate limited
        const now = Date.now();
        const timeSinceLastMessage = now - this.lastMessageTime;

        if (timeSinceLastMessage < this.rateLimit && this.messageCount >= this.burstLimit) {
            // Rate limited.  Don't execute the callback.
            return false; // Indicate rate limiting
        }

        if (now - this.lastMessageTime > this.burstWindow) {
            this.messageCount = 0; // Reset burst counter after burst window
        }

        this.lastMessageTime = now;
        this.messageCount++;

        if (typeof callback === 'function') {
            callback(); // Execute the provided callback
        }

        return true; // Indicate that the action was allowed
    }

    // Optional: Methods to adjust rate limits dynamically
    setRateLimit(rateLimit) {
        this.rateLimit = rateLimit;
    }

    setBurstLimit(burstLimit) {
        this.burstLimit = burstLimit;
    }

    setBurstWindow(burstWindow) {
        this.burstWindow = burstWindow;
    }
}
