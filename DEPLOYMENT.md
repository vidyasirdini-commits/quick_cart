# QuickCart Deployment & Operations Guide

This guide outlines deployment procedures for QuickCart across modern cloud providers, including Vercel, Netlify, Render, and Railway, as well as Docker container orchestration.

---

## 1. Architecture Overview

- **Frontend**: Single Page Application built with React 18, Vite, and Tailwind CSS.
- **Backend**: Express REST API with Helmet security, CORS restrictions, Zod schema validation, JWT auth, and Gzip compression.
- **Database**: PostgreSQL with Prisma ORM (with in-memory fallback for offline dev/test execution).

---

## 2. Environment Variables

### Backend (`/server/.env`)
| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` / `development` |
| `PORT` | API listening port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/quickcart_db?schema=public` |
| `JWT_SECRET` | Secret key for signing tokens | `secure_random_hex_string_64_chars` |
| `JWT_EXPIRES_IN` | Token lifespan | `1h` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `https://quickcart.vercel.app` |

### Frontend (`/client/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base path | `/api` (or `https://quickcart-api.onrender.com/api`) |

---

## 3. Frontend Deployment

### Deploying to Vercel
1. Connect your GitHub repository to Vercel.
2. Set Root Directory to `client`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. SPA routing is automatically handled by [`client/vercel.json`](file:///d:/Projects/quick_cart/client/vercel.json).

### Deploying to Netlify
1. Connect your repository to Netlify.
2. Base directory: `client`.
3. Build command: `npm run build`.
4. Publish directory: `client/dist`.
5. SPA rewrites are handled by [`client/public/_redirects`](file:///d:/Projects/quick_cart/client/public/_redirects).

---

## 4. Backend Deployment

### Deploying to Render
1. Create a new **Blueprint** deployment using the included [`render.yaml`](file:///d:/Projects/quick_cart/render.yaml).
2. Render will automatically provision a managed PostgreSQL database and deploy the `quickcart-api` web service.
3. Health check path is configured to `/api/health`.

### Deploying to Railway
1. Connect the repository in Railway dashboard.
2. Add a PostgreSQL plugin service.
3. Link the `DATABASE_URL` environment variable.
4. Deploy using the included [`railway.json`](file:///d:/Projects/quick_cart/railway.json).

---

## 5. Docker Deployment

### Building the Server Image
```bash
docker build -t quickcart-server:latest -f server/Dockerfile server/
```

### Running the Container
```bash
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:pass@host:5432/quickcart" \
  -e JWT_SECRET="your_production_jwt_secret" \
  --name quickcart-api \
  quickcart-server:latest
```

---

## 6. Health Checks & Telemetry

- **Endpoint**: `GET /api/health`
- **Expected Status**: `200 OK`
- **Response Structure**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "QuickCart API Server",
    "timestamp": "2026-10-14T15:30:00.000Z",
    "uptime": 1248.5
  }
}
```
