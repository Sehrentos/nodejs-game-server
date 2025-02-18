import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'yourSecretKey'; // Replace with your own secret key

/**
 * Generates a JWT token from the given payload.
 *
 * @param {object} payload - The payload to encode in the token.
 * @param {string} [expiresIn='1h'] - The expiration time of the token. e.g. `"1h"`, `"2d"`, etc.
 * @returns {string} The generated JWT token.
 */
export function generateToken(payload, expiresIn = '1h') {
  const token = jwt.sign(payload, SECRET, {
    expiresIn: '1h', // Token expiration time
  });
  return token;
}

export function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, payload) => {
      if (err) {
        return reject(err);
      }
      resolve(payload);
    });
  })
}
