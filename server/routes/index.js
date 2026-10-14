const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const storeRoutes = require('./storeRoutes');
const partnerProductRoutes = require('./partnerProductRoutes');
const orderRoutes = require('./orderRoutes');

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/partner/products', partnerProductRoutes);
router.use('/orders', orderRoutes);

module.exports = router;

