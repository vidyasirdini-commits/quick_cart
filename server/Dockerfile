# Multi-stage production Dockerfile for QuickCart Express Server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci --only=production
RUN npx prisma generate

# Final lean runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node modules and app files
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma/
COPY controllers ./controllers/
COPY middleware ./middleware/
COPY models ./models/
COPY routes ./routes/
COPY utils ./utils/
COPY server.js ./

# Run as non-root user for security
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
