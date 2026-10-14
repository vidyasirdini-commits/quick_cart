const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { prisma, memoryDB } = require('../models/db');
const { signToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'partner', 'admin', 'delivery']).default('customer'),
  storeName: z.string().optional(),
  zone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper to sanitize user object
const sanitizeUser = (user, store = null) => {
  const { password_hash, ...safeUser } = user;
  return {
    ...safeUser,
    ...(store ? { store } : {}),
  };
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, storeName, zone } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Try Prisma first, fallback to memoryDB
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    } catch {
      existingUser = memoryDB.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    }

    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let createdUser = null;
    let createdStore = null;

    try {
      createdUser = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password_hash: passwordHash,
          role,
          zone_id: zone || null,
        },
      });

      if (role === 'partner' && storeName) {
        createdStore = await prisma.store.create({
          data: {
            owner_id: createdUser.id,
            name: storeName,
            zone_id: zone || '1',
            is_open: true,
          },
        });
      }
    } catch {
      // Memory fallback
      createdUser = {
        id: `usr-${Date.now()}`,
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        role,
        zone_id: zone || 'zone-1',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      memoryDB.users.push(createdUser);

      if (role === 'partner' && storeName) {
        createdStore = {
          id: `store-${Date.now()}`,
          owner_id: createdUser.id,
          name: storeName,
          zone_id: zone || 'zone-1',
          is_open: true,
          created_at: new Date().toISOString(),
        };
        memoryDB.stores.push(createdStore);
      }
    }

    const tokenPayload = {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      name: createdUser.name,
      zone_id: createdUser.zone_id,
    };

    const token = signToken(tokenPayload);

    return successResponse(
      res,
      {
        user: sanitizeUser(createdUser, createdStore),
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let user = null;
    let store = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { stores: true },
      });
      if (user && user.stores && user.stores.length > 0) {
        store = user.stores[0];
      }
    } catch {
      user = memoryDB.users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (user) {
        store = memoryDB.stores.find((s) => s.owner_id === user.id) || null;
      }
    }

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (user.is_active === false) {
      return errorResponse(res, 'Account is deactivated. Please contact support.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      zone_id: user.zone_id,
    };

    const token = signToken(tokenPayload);

    return successResponse(res, {
      user: sanitizeUser(user, store),
      token,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    let user = null;
    let store = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { stores: true, zone: true },
      });
      if (user && user.stores && user.stores.length > 0) {
        store = user.stores[0];
      }
    } catch {
      user = memoryDB.users.find((u) => u.id === req.user.id);
      if (user) {
        store = memoryDB.stores.find((s) => s.owner_id === user.id) || null;
      }
    }

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, {
      user: sanitizeUser(user, store),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  register,
  login,
  getMe,
};
