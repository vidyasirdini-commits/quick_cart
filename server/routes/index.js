const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const storeRoutes = require('./storeRoutes');
const partnerProductRoutes = require('./partnerProductRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');
const eventRoutes = require('./eventRoutes');
const paymentRoutes = require('./paymentRoutes');

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/partner/products', partnerProductRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/events', eventRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;

