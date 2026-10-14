const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  zoneSchema,
  assignZoneSchema,
  getAdminStats,
  getAdminTransactions,
  getZones,
  createZone,
  updateZone,
  assignToZone,
  getUsers,
  toggleUserActive,
} = require('../controllers/adminController');

// All Admin routes require authentication and 'admin' role
router.use(authenticate, authorize('admin'));

// Analytics & Telemetry
router.get('/stats', getAdminStats);

// Transactions & Audit Ledger
router.get('/transactions', getAdminTransactions);

// Zone Management
router.get('/zones', getZones);
router.post('/zones', validate(zoneSchema), createZone);
router.put('/zones/:id', validate(zoneSchema), updateZone);
router.post('/zones/:id/assign', validate(assignZoneSchema), assignToZone);

// User Directory
router.get('/users', getUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);

module.exports = router;
