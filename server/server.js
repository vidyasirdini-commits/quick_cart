const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Headers
app.use(helmet());
app.use(compression());

// CORS restricted to client origin
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'QuickCart API Server',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Mount modular API routes
app.use('/api', apiRoutes);

// Centralized error handling returning consistent JSON { success: false, error }
app.use((err, req, res, next) => {
  console.error('[QuickCart API Error]', err);

  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const errorMessage = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    ...(err.details ? { details: err.details } : {}),
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 QuickCart Server running on port ${PORT}`);
    console.log(`🛡️ Client origin configured: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
}

module.exports = app;
