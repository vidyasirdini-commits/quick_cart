const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  registerSchema,
  loginSchema,
} = require('../controllers/authController');
const { authenticate, validate, authLimiter } = require('../middleware');

// POST /api/auth/register (Rate-limited, Zod-validated)
router.post('/register', authLimiter, validate(registerSchema), register);

// POST /api/auth/login (Rate-limited, Zod-validated)
router.post('/login', authLimiter, validate(loginSchema), login);

// GET /api/auth/me (Protected with authenticate middleware)
router.get('/me', authenticate, getMe);

module.exports = router;
