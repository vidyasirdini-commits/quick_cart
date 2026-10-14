const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/jwt');
const { prisma, memoryDB } = require('../models/db');
const eventBus = require('../utils/eventBus');

// GET /api/events - Server-Sent Events stream
router.get('/', async (req, res) => {
  // Extract token from header or query param
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required for SSE stream' });
  }

  let user = null;
  try {
    user = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token for SSE stream' });
  }

  // If partner, resolve storeId
  let storeId = null;
  if (user.role === 'partner') {
    try {
      const store = await prisma.store.findFirst({ where: { owner_id: user.id } });
      if (store) storeId = store.id;
    } catch {
      const store = memoryDB.stores.find((s) => s.owner_id === user.id);
      if (store) storeId = store.id;
    }
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const clientId = `client_${user.id}_${Date.now()}`;
  eventBus.addClient({
    id: clientId,
    userId: user.id,
    role: user.role,
    storeId,
    res,
  });
});

module.exports = router;
