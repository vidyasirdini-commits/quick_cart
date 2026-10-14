const { prisma, memoryDB } = require('../models/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/stores?zone=&search=
const getStores = async (req, res, next) => {
  try {
    const { zone, search } = req.query;

    let stores = [];
    try {
      const whereClause = {};

      if (zone && zone !== 'all') {
        whereClause.zone_id = zone;
      }

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      stores = await prisma.store.findMany({
        where: whereClause,
        include: {
          zone: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch {
      // Memory fallback
      stores = memoryDB.stores.filter((store) => {
        const matchesZone = !zone || zone === 'all' || store.zone_id === zone;
        const matchesSearch =
          !search || store.name.toLowerCase().includes(search.toLowerCase());
        return matchesZone && matchesSearch;
      }).map((s) => {
        const z = memoryDB.zones.find((zn) => zn.id === s.zone_id);
        const prodCount = memoryDB.products.filter((p) => p.store_id === s.id).length;
        return {
          ...s,
          zone: z || { id: s.zone_id, name: 'Default Zone' },
          product_count: prodCount,
        };
      });
    }

    return successResponse(res, stores);
  } catch (error) {
    next(error);
  }
};

// GET /api/stores/:id/products?category=&search=&inStock=
const getStoreProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, search, inStock } = req.query;

    let store = null;
    let products = [];

    try {
      store = await prisma.store.findUnique({
        where: { id },
        include: { zone: true },
      });

      if (!store) {
        return errorResponse(res, 'Store not found', 404);
      }

      const whereClause = {
        store_id: id,
        is_active: true,
      };

      if (category && category !== 'All') {
        whereClause.category = category;
      }

      if (search) {
        whereClause.name = { contains: search, mode: 'insensitive' };
      }

      if (inStock === 'true' || inStock === true) {
        whereClause.stock_qty = { gt: 0 };
      }

      products = await prisma.product.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
      });
    } catch {
      // Memory fallback
      store = memoryDB.stores.find((s) => s.id === id);
      if (!store) {
        // Fallback: pick the first store if mock id doesn't match
        store = memoryDB.stores[0];
      }

      products = memoryDB.products.filter((p) => {
        const matchesStore = p.store_id === store.id;
        const matchesActive = p.is_active !== false;
        const matchesCat = !category || category === 'All' || p.category === category;
        const matchesSearch =
          !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchesStock =
          !(inStock === 'true' || inStock === true) || p.stock_qty > 0;

        return matchesStore && matchesActive && matchesCat && matchesSearch && matchesStock;
      });
    }

    return successResponse(res, {
      store,
      products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  getStoreProducts,
};
