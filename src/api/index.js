import express from 'express';
import login from './login/index.js';
import register from './register/index.js';
const api = express.Router();

// routes /api/<*>
api.use('/login', login);
api.use('/register', register)

export default api;