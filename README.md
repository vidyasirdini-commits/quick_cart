# QuickCart - Hyperlocal Delivery Platform

QuickCart is a modern full-stack hyperlocal delivery platform that unifies inventory management, customer ordering, and end-to-end transparent order tracking across customers, store partners, administrators, and delivery executives.

## Architecture

- **Client (`/client`)**: React + Vite + Tailwind CSS + React Router
- **Server (`/server`)**: Node.js + Express + Prisma ORM / PostgreSQL
- **Authentication**: JWT + bcrypt with Role-Based Access Control (RBAC)

## Project Structure

```
quickcart/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI component library
│   │   ├── context/        # Auth and Cart React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # PublicLayout, DashboardLayout
│   │   ├── pages/          # All role pages and error views
│   │   ├── services/       # Axios API client & endpoints
│   │   └── utils/          # Formatting & status helpers
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                 # Express REST API backend
│   ├── controllers/        # Request handling logic
│   ├── middleware/         # Auth, validation, error handling
│   ├── models/             # Database access / Prisma client
│   ├── routes/             # API routes (auth, stores, orders, admin)
│   ├── utils/              # Helper utilities
│   ├── prisma/             # Schema, migrations & seed scripts
│   ├── .env.example
│   └── package.json
├── package.json            # Root workspace scripts
└── README.md
```

## Quick Start

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database instance

### 2. Setup Environment Variables
Copy `.env.example` to `.env` in both `/client` and `/server`:
```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

### 3. Install Dependencies
From the repository root:
```bash
npm install
```

### 4. Database Setup (Server)
```bash
cd server
npx prisma migrate dev --name init
npm run seed
cd ..
```

### 5. Run Concurrently (Dev Mode)
```bash
npm run dev
```
Client runs at `http://localhost:5173` and Server runs at `http://localhost:5000`.

## Git Branching Strategy
- `main`: Production-ready code.
- `develop`: Integration branch for completed features.
- `feature/*`: Feature development branches created off `develop`.
