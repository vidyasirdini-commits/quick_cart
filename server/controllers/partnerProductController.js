const { z } = require('zod');
const { prisma, memoryDB } = require('../models/db');
const { successResponse, errorResponse } = require('../utils/response');

// Validation Schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  stock_qty: z.coerce.number().int('Stock quantity must be an integer').min(0, 'Stock cannot be negative'),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0').optional(),
  stock_qty: z.coerce.number().int('Stock quantity must be an integer').min(0, 'Stock cannot be negative').optional(),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});

// Helper: Resolve partner's store
const getPartnerStore = async (userId, userRole) => {
  let store = null;
  try {
    store = await prisma.store.findFirst({
      where: { owner_id: userId },
    });
    if (!store && userRole === 'admin') {
      store = await prisma.store.findFirst();
    }
  } catch {
    store = memoryDB.stores.find((s) => s.owner_id === userId);
    if (!store && (userRole === 'admin' || userRole === 'partner')) {
      store = memoryDB.stores[0];
    }
  }
  return store;
};

// GET /api/partner/products
const getPartnerProducts = async (req, res, next) => {
  try {
    const store = await getPartnerStore(req.user.id, req.user.role);
    if (!store) {
      return errorResponse(res, 'No store found associated with your partner account', 404);
    }

    const { search, category } = req.query;

    let products = [];
    try {
      const whereClause = { store_id: store.id };

      if (category && category !== 'All') {
        whereClause.category = category;
      }
      if (search) {
        whereClause.name = { contains: search, mode: 'insensitive' };
      }

      products = await prisma.product.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
      });
    } catch {
      products = memoryDB.products.filter((p) => {
        const matchesStore = p.store_id === store.id;
        const matchesCategory = !category || category === 'All' || p.category === category;
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchesStore && matchesCategory && matchesSearch;
      });
    }

    return successResponse(res, { store, products });
  } catch (error) {
    next(error);
  }
};

// GET /api/partner/products/:id
const getPartnerProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const store = await getPartnerStore(req.user.id, req.user.role);
    if (!store) {
      return errorResponse(res, 'No store associated with your account', 404);
    }

    let product = null;
    try {
      product = await prisma.product.findUnique({ where: { id } });
    } catch {
      product = memoryDB.products.find((p) => p.id === id);
    }

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Scoped strictly to partner's store
    if (product.store_id !== store.id && req.user.role !== 'admin') {
      return errorResponse(
        res,
        'Access denied: You do not have permission to view products from another store',
        403
      );
    }

    return successResponse(res, product);
  } catch (error) {
    next(error);
  }
};

// POST /api/partner/products
const createPartnerProduct = async (req, res, next) => {
  try {
    const store = await getPartnerStore(req.user.id, req.user.role);
    if (!store) {
      return errorResponse(res, 'No store associated with your account to add products to', 404);
    }

    const { name, category, price, stock_qty, image_url, is_active } = req.body;

    let createdProduct = null;
    try {
      createdProduct = await prisma.product.create({
        data: {
          store_id: store.id,
          name,
          category,
          price,
          stock_qty,
          image_url: image_url || null,
          is_active: is_active !== undefined ? is_active : true,
        },
      });
    } catch {
      createdProduct = {
        id: `p-${Date.now()}`,
        store_id: store.id,
        name,
        category,
        price,
        stock_qty,
        image_url: image_url || null,
        is_active: is_active !== undefined ? is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memoryDB.products.unshift(createdProduct);
    }

    return successResponse(res, createdProduct, 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/partner/products/:id
const updatePartnerProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const store = await getPartnerStore(req.user.id, req.user.role);
    if (!store) {
      return errorResponse(res, 'No store associated with your account', 404);
    }

    let existing = null;
    try {
      existing = await prisma.product.findUnique({ where: { id } });
    } catch {
      existing = memoryDB.products.find((p) => p.id === id);
    }

    if (!existing) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Scoped strictly to partner's store
    if (existing.store_id !== store.id && req.user.role !== 'admin') {
      return errorResponse(
        res,
        'Access denied: You cannot edit products belonging to another store',
        403
      );
    }

    const updates = req.body;

    let updatedProduct = null;
    try {
      updatedProduct = await prisma.product.update({
        where: { id },
        data: updates,
      });
    } catch {
      const idx = memoryDB.products.findIndex((p) => p.id === id);
      if (idx !== -1) {
        memoryDB.products[idx] = {
          ...memoryDB.products[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        updatedProduct = memoryDB.products[idx];
      }
    }

    return successResponse(res, updatedProduct);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/partner/products/:id
const deletePartnerProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const store = await getPartnerStore(req.user.id, req.user.role);
    if (!store) {
      return errorResponse(res, 'No store associated with your account', 404);
    }

    let existing = null;
    try {
      existing = await prisma.product.findUnique({ where: { id } });
    } catch {
      existing = memoryDB.products.find((p) => p.id === id);
    }

    if (!existing) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Reject access to other stores' products
    if (existing.store_id !== store.id && req.user.role !== 'admin') {
      return errorResponse(
        res,
        'Access denied: You cannot delete products belonging to another store',
        403
      );
    }

    try {
      await prisma.product.delete({ where: { id } });
    } catch {
      memoryDB.products = memoryDB.products.filter((p) => p.id !== id);
    }

    return successResponse(res, { message: 'Product deleted successfully', id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  getPartnerProducts,
  getPartnerProductById,
  createPartnerProduct,
  updatePartnerProduct,
  deletePartnerProduct,
};
