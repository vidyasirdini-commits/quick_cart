const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const storeRoutes = require('./storeRoutes');
const partnerProductRoutes = require('./partnerProductRoutes');

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/partner/products', partnerProductRoutes);

module.exports = router;
