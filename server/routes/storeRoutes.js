const express = require('express');
const router = express.Router();
const { getStores, getStoreProducts } = require('../controllers/storeController');

// GET /api/stores (Public directory, filter by zone & search)
router.get('/', getStores);

// GET /api/stores/:id/products (Public catalog, filter by category, search, inStock)
router.get('/:id/products', getStoreProducts);

module.exports = router;
