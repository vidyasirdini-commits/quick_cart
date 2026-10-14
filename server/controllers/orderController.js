const { z } = require('zod');
const { prisma, memoryDB } = require('../models/db');
const { successResponse, errorResponse } = require('../utils/response');

// Validation Schemas
const createOrderSchema = z.object({
  store_id: z.string().min(1, 'Store ID is required'),
  delivery_address: z.string().min(5, 'Delivery address is required'),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1, 'Product ID is required'),
        qty: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required in the order'),
});

const updateStatusSchema = z.object({
  status: z.enum([
    'placed',
    'accepted',
    'packed',
    'out_for_delivery',
    'delivered',
    'rejected',
    'cancelled',
  ]),
  reason: z.string().optional(),
});

// Helper to find partner's store
const getPartnerStore = async (userId) => {
  try {
    return await prisma.store.findFirst({ where: { owner_id: userId } });
  } catch {
    return memoryDB.stores.find((s) => s.owner_id === userId) || memoryDB.stores[0];
  }
};

// POST /api/orders (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { store_id, delivery_address, items } = req.body;
    const customerId = req.user.id;

    // Resolve store to fetch zone
    let store = null;
    try {
      store = await prisma.store.findUnique({ where: { id: store_id } });
    } catch {
      store = memoryDB.stores.find((s) => s.id === store_id) || memoryDB.stores[0];
    }

    if (!store) {
      return errorResponse(res, 'Store not found', 404);
    }

    if (!store.is_open) {
      return errorResponse(res, 'Store is currently closed for orders', 400);
    }

    // Transactional stock validation
    let validatedItems = [];
    let itemsSubtotal = 0;

    try {
      // Prisma DB Transaction
      const order = await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.product_id },
          });

          if (!product || !product.is_active || product.store_id !== store.id) {
            throw new Error(`Product ${item.product_id} is unavailable or from another store`);
          }

          if (product.stock_qty < item.qty) {
            throw new Error(
              `Insufficient stock for "${product.name}". Available: ${product.stock_qty}, Requested: ${item.qty}`
            );
          }

          const unitPrice = Number(product.price);
          itemsSubtotal += unitPrice * item.qty;

          validatedItems.push({
            product_id: product.id,
            product_name: product.name,
            qty: item.qty,
            unit_price: unitPrice,
          });
        }

        const deliveryFee = 30;
        const platformFee = 10;
        const total = itemsSubtotal + deliveryFee + platformFee;

        // 1. Create Order
        const newOrder = await tx.order.create({
          data: {
            customer_id: customerId,
            store_id: store.id,
            zone_id: store.zone_id,
            status: 'placed',
            total,
            delivery_address,
          },
        });

        // 2. Create Order Items
        for (const vItem of validatedItems) {
          await tx.orderItem.create({
            data: {
              order_id: newOrder.id,
              product_id: vItem.product_id,
              qty: vItem.qty,
              unit_price: vItem.unit_price,
            },
          });
        }

        // 3. Status History Entry
        await tx.orderStatusHistory.create({
          data: {
            order_id: newOrder.id,
            status: 'placed',
            changed_by: req.user.name || 'Customer',
          },
        });

        return newOrder;
      });

      return successResponse(res, order, 201);
    } catch (dbError) {
      // If error was insufficient stock or validation, return 400
      if (
        dbError.message.includes('Insufficient stock') ||
        dbError.message.includes('unavailable')
      ) {
        return errorResponse(res, dbError.message, 400);
      }

      // Memory DB fallback transaction
      validatedItems = [];
      itemsSubtotal = 0;

      for (const item of items) {
        const product = memoryDB.products.find((p) => p.id === item.product_id);
        if (!product || product.is_active === false) {
          return errorResponse(res, `Product ${item.product_id} is currently unavailable`, 400);
        }

        if (product.stock_qty < item.qty) {
          return errorResponse(
            res,
            `Insufficient stock for "${product.name}". Available: ${product.stock_qty}, Requested: ${item.qty}`,
            400
          );
        }

        const unitPrice = Number(product.price);
        itemsSubtotal += unitPrice * item.qty;

        validatedItems.push({
          product_id: product.id,
          product_name: product.name,
          qty: item.qty,
          unit_price: unitPrice,
        });
      }

      const deliveryFee = 30;
      const platformFee = 10;
      const total = itemsSubtotal + deliveryFee + platformFee;

      const orderId = `ord-${Date.now().toString().slice(-6)}`;
      const newOrder = {
        id: orderId,
        customer_id: customerId,
        store_id: store.id,
        store_name: store.name,
        zone_id: store.zone_id,
        status: 'placed',
        total,
        delivery_address,
        delivery_exec_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      memoryDB.orders.unshift(newOrder);

      for (const vItem of validatedItems) {
        memoryDB.order_items.push({
          id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          order_id: orderId,
          product_id: vItem.product_id,
          name: vItem.product_name,
          qty: vItem.qty,
          unit_price: vItem.unit_price,
        });
      }

      memoryDB.order_status_history.push({
        id: `h-${Date.now()}`,
        order_id: orderId,
        status: 'placed',
        changed_by: req.user.name || 'Customer',
        changed_at: new Date().toISOString(),
      });

      return successResponse(res, newOrder, 201);
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/orders (Scoped by Role)
const getOrders = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;

    let orders = [];
    try {
      const whereClause = {};

      if (role === 'customer') {
        whereClause.customer_id = userId;
      } else if (role === 'partner') {
        const store = await getPartnerStore(userId);
        if (store) {
          whereClause.store_id = store.id;
        } else {
          return successResponse(res, []);
        }
      } else if (role === 'delivery') {
        whereClause.OR = [
          { delivery_exec_id: userId },
          { delivery_exec_id: null, status: 'packed' },
        ];
      }
      // admin sees all orders (whereClause is empty)

      orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          store: true,
          customer: { select: { id: true, name: true, email: true } },
          delivery_exec: { select: { id: true, name: true } },
          items: {
            include: { product: true },
          },
          status_history: {
            orderBy: { changed_at: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    } catch {
      // Memory fallback
      let partnerStore = null;
      if (role === 'partner') {
        partnerStore = memoryDB.stores.find((s) => s.owner_id === userId) || memoryDB.stores[0];
      }

      orders = memoryDB.orders.filter((ord) => {
        if (role === 'customer') return ord.customer_id === userId;
        if (role === 'partner') return partnerStore ? ord.store_id === partnerStore.id : true;
        if (role === 'delivery') return ord.delivery_exec_id === userId || (!ord.delivery_exec_id && ord.status === 'packed');
        return true; // admin
      }).map((ord) => {
        const store = memoryDB.stores.find((s) => s.id === ord.store_id) || { name: 'Local Store' };
        const customer = memoryDB.users.find((u) => u.id === ord.customer_id) || { name: 'Customer' };
        const items = memoryDB.order_items.filter((oi) => oi.order_id === ord.id);
        const history = memoryDB.order_status_history.filter((h) => h.order_id === ord.id);

        return {
          ...ord,
          store_name: store.name,
          store,
          customer,
          items,
          status_history: history,
        };
      });
    }

    return successResponse(res, orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id (Scoped by Role)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    let order = null;
    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: {
          store: true,
          customer: { select: { id: true, name: true, email: true } },
          delivery_exec: { select: { id: true, name: true } },
          items: {
            include: { product: true },
          },
          status_history: {
            orderBy: { changed_at: 'asc' },
          },
        },
      });
      if (!order) throw new Error('Order not found in Prisma DB');
    } catch {
      const ord = memoryDB.orders.find((o) => o.id === id);
      if (ord) {
        const store = memoryDB.stores.find((s) => s.id === ord.store_id) || { name: 'Local Store' };
        const customer = memoryDB.users.find((u) => u.id === ord.customer_id) || { name: 'Customer' };
        const delivery_exec = ord.delivery_exec_id
          ? memoryDB.users.find((u) => u.id === ord.delivery_exec_id)
          : null;
        const items = memoryDB.order_items
          .filter((oi) => oi.order_id === ord.id)
          .map((oi) => {
            const prod = memoryDB.products.find((p) => p.id === oi.product_id);
            return { ...oi, name: prod?.name || oi.name || 'Item' };
          });
        const history = memoryDB.order_status_history.filter((h) => h.order_id === ord.id);

        order = {
          ...ord,
          store_name: store.name,
          store,
          customer,
          delivery_exec,
          items,
          status_history: history,
        };
      }
    }

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Role-based Access Verification
    if (role === 'customer' && order.customer_id !== userId) {
      return errorResponse(res, 'Access denied: You cannot view orders placed by another customer', 403);
    }

    if (role === 'partner') {
      let partnerStore = null;
      try {
        partnerStore = await prisma.store.findFirst({ where: { owner_id: userId } });
      } catch {
        partnerStore = memoryDB.stores.find((s) => s.owner_id === userId);
      }
      if (partnerStore && order.store_id !== partnerStore.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied: Order does not belong to your store', 403);
      }
    }

    if (
      role === 'delivery' &&
      order.delivery_exec_id &&
      order.delivery_exec_id !== userId &&
      req.user.role !== 'admin'
    ) {
      return errorResponse(res, 'Access denied: Order is assigned to another delivery courier', 403);
    }

    return successResponse(res, order);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/status (Server-enforced State Machine)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: targetStatus, reason } = req.body;
    const { role, id: userId, name: userName } = req.user;

    // Fetch existing order
    let order = null;
    let orderItems = [];

    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: { items: true, store: true },
      });
      if (!order) throw new Error('Order not found in Prisma');
      orderItems = order?.items || [];
    } catch {
      order = memoryDB.orders.find((o) => o.id === id);
      orderItems = memoryDB.order_items.filter((oi) => oi.order_id === id);
    }

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const currentStatus = order.status;

    // Server-enforced State Machine validation:
    // partner: placed -> accepted | rejected
    // partner: accepted -> packed
    // partner: packed -> out_for_delivery (handover, assigns delivery executive)
    // partner/admin: accepted | packed -> cancelled | rejected
    // delivery: out_for_delivery -> delivered
    // customer: placed -> cancelled (only while placed)
    let isAllowed = false;
    let assignedCourierId = order.delivery_exec_id;

    if (role === 'partner' || role === 'admin') {
      if (currentStatus === 'placed' && (targetStatus === 'accepted' || targetStatus === 'rejected')) {
        isAllowed = true;
      } else if (currentStatus === 'accepted' && targetStatus === 'packed') {
        isAllowed = true;
      } else if (currentStatus === 'packed' && targetStatus === 'out_for_delivery') {
        isAllowed = true;
        // Assign a delivery executive from the zone
        try {
          const courier = await prisma.user.findFirst({
            where: { role: 'delivery', zone_id: order.zone_id },
          });
          if (courier) assignedCourierId = courier.id;
        } catch {
          const courier = memoryDB.users.find(
            (u) => u.role === 'delivery' && (u.zone_id === order.zone_id || !u.zone_id)
          );
          if (courier) assignedCourierId = courier.id;
        }
      } else if (['accepted', 'packed'].includes(currentStatus) && (targetStatus === 'cancelled' || targetStatus === 'rejected')) {
        isAllowed = true;
      }
    }

    if (role === 'delivery' || role === 'admin') {
      if (currentStatus === 'out_for_delivery' && targetStatus === 'delivered') {
        isAllowed = true;
        if (!assignedCourierId) assignedCourierId = userId;
      }
    }

    if (role === 'customer') {
      if (currentStatus === 'placed' && targetStatus === 'cancelled') {
        isAllowed = true;
      } else if (targetStatus === 'cancelled') {
        return errorResponse(
          res,
          `Cannot cancel order once it has been ${currentStatus}. Please contact store support.`,
          400
        );
      }
    }

    if (role === 'admin' && currentStatus === 'placed' && targetStatus === 'cancelled') {
      isAllowed = true;
    }

    if (!isAllowed) {
      return errorResponse(
        res,
        `Invalid status transition from '${currentStatus}' to '${targetStatus}' for role '${role}'`,
        400
      );
    }

    // Transactional Stock Management:
    // - On acceptance: decrement stock
    // - On cancel after acceptance: restore stock
    try {
      await prisma.$transaction(async (tx) => {
        // If moving from placed -> accepted, decrement stock
        if (currentStatus === 'placed' && targetStatus === 'accepted') {
          for (const item of orderItems) {
            await tx.product.update({
              where: { id: item.product_id },
              data: { stock_qty: { decrement: item.qty } },
            });
          }
        }

        // If moving from accepted/packed -> cancelled or rejected, restore stock
        if (['accepted', 'packed'].includes(currentStatus) && (targetStatus === 'cancelled' || targetStatus === 'rejected')) {
          for (const item of orderItems) {
            await tx.product.update({
              where: { id: item.product_id },
              data: { stock_qty: { increment: item.qty } },
            });
          }
        }

        // Update Order
        await tx.order.update({
          where: { id },
          data: {
            status: targetStatus,
            delivery_exec_id: assignedCourierId,
          },
        });

        // Write to order_status_history
        await tx.orderStatusHistory.create({
          data: {
            order_id: id,
            status: targetStatus,
            changed_by: `${userName || role} (${role})${reason ? `: ${reason}` : ''}`,
          },
        });
      });
    } catch {
      // Memory fallback stock adjustment
      if (currentStatus === 'placed' && targetStatus === 'accepted') {
        for (const item of orderItems) {
          const prod = memoryDB.products.find((p) => p.id === item.product_id);
          if (prod) prod.stock_qty = Math.max(0, prod.stock_qty - item.qty);
        }
      }

      if (['accepted', 'packed'].includes(currentStatus) && (targetStatus === 'cancelled' || targetStatus === 'rejected')) {
        for (const item of orderItems) {
          const prod = memoryDB.products.find((p) => p.id === item.product_id);
          if (prod) prod.stock_qty += item.qty;
        }
      }

      order.status = targetStatus;
      order.delivery_exec_id = assignedCourierId;
      order.updated_at = new Date().toISOString();

      memoryDB.order_status_history.push({
        id: `h-${Date.now()}`,
        order_id: id,
        status: targetStatus,
        changed_by: `${userName || role} (${role})${reason ? `: ${reason}` : ''}`,
        changed_at: new Date().toISOString(),
      });
    }

    return successResponse(res, {
      id,
      status: targetStatus,
      delivery_exec_id: assignedCourierId,
      message: `Order status successfully transitioned to ${targetStatus}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrderSchema,
  updateStatusSchema,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
