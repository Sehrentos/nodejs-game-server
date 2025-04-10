import express from 'express';
import login from './login/index.js';
import register from './register/index.js';
import { createRateLimitter } from './middleware.js'; // plan B: "express-rate-limit" module
const api = express.Router();

// rate limiter here means that
// requests to /api/login and /api/register
// are rate-limited for 3-5 seconds
// because who wants to be spammed

// routes /api/<*>
api.use('/login', createRateLimitter({ rateLimitWindow: 3000 }), login);
api.use('/register', createRateLimitter({ rateLimitWindow: 5000 }), register)

export default api;