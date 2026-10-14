const express = require('express');
const router = express.Router();
const {
  getPartnerProducts,
  getPartnerProductById,
  createPartnerProduct,
  updatePartnerProduct,
  deletePartnerProduct,
  createProductSchema,
  updateProductSchema,
} = require('../controllers/partnerProductController');
const { authenticate, authorize, validate } = require('../middleware');

// Protect all partner product routes with authenticate + authorize('partner', 'admin')
router.use(authenticate, authorize('partner', 'admin'));

// GET /api/partner/products - list all products for the partner's store
router.get('/', getPartnerProducts);

// POST /api/partner/products - create product for the partner's store
router.post('/', validate(createProductSchema), createPartnerProduct);

// GET /api/partner/products/:id - view specific product
router.get('/:id', getPartnerProductById);

// PATCH /api/partner/products/:id - update product
router.patch('/:id', validate(updateProductSchema), updatePartnerProduct);

// DELETE /api/partner/products/:id - remove product
router.delete('/:id', deletePartnerProduct);

module.exports = router;
