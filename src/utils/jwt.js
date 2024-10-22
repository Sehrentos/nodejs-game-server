import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'yourSecretKey'; // Replace with your own secret key

export function generateToken(payload) {
  const options = {
    expiresIn: '1h', // Token expiration time
  };
  const token = jwt.sign(payload, SECRET, options);
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