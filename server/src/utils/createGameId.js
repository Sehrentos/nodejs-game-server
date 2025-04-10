import { randomBytes } from 'node:crypto';

/**
 * Creates a new game ID `(gid)`
 * @returns {string}
 */
export default function createGameId() {
    return randomBytes(16).toString('hex')
}
