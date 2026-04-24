# Home Harmony

Monorepo for a real estate web app: **React (Vite) + TypeScript** frontend, **Express + MongoDB** backend, and optional static marketing build. Auth, roles (buyer, seller, agent, admin), listings, tours, messaging, and notifications are included.

## Stack

| Layer | Technology |
|--------|------------|
| Frontend | Vite 5, React 18, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | Node.js (ESM), Express, Mongoose, Socket.IO, JWT |
| Database | MongoDB (local or **MongoDB Atlas** in production) |

## Repository layout

```
home-harmony/
├── frontend/          # Main SPA (Vite) → output: frontend/dist
├── backend/           # API + serves frontend/dist in production
├── render.yaml        # Render Blueprint (optional)
├── DEPLOYMENT.md      # Production deploy on Render + Atlas
├── .env.example       # Copy to .env at repo root for local dev
└── package.json       # Root scripts (dev, build, Render)
```

## Prerequisites

- **Node.js 18+** (Node **20** recommended; see `.node-version` for Render)
- **npm**
- **MongoDB** running locally, or an Atlas cluster for hosted deploys

## Local development

1. **Environment**

   From the repository root:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`: set `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` (e.g. `http://localhost:8080`), and `VITE_API_URL` (e.g. `http://localhost:5000/api`) when the API runs on a different port than Vite.

2. **Install and run**

   ```bash
   # Frontend only (Vite dev server, default port 8080)
   npm install --prefix frontend
   npm run dev

   # Backend API (from another terminal, default port 5000)
   npm install --prefix backend
   npm run backend:dev
   ```

   From the repo root you can use: `npm run dev` (frontend) and `npm run backend:dev` (backend).

3. **Full stack on one port (optional)**

   Build the SPA and serve it with Express:

   ```bash
   npm run serve:production
   ```

   Then open the URL logged in the terminal (uses `PORT` from `.env`, default `5000`).

## Useful scripts (repo root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (`frontend`) |
| `npm run backend:dev` | Start API with nodemon (`backend`) |
| `npm run build` | Production build of the main frontend (`frontend/dist`) |
| `npm run serve:production` | Build + install backend deps + start Express with SPA |
| `npm run render:build` | **Render** build pipeline (see `DEPLOYMENT.md`) |
| `npm run render:start` | **Render** start command |
| `npm run seed:superadmin` | Bootstrap super-admin user (see `backend/scripts`) |

## Deploy to production

Production is documented for **Render** (single Web Service) and **MongoDB Atlas**:

**[DEPLOYMENT.md](./DEPLOYMENT.md)**

That guide covers the Blueprint (`render.yaml`), required environment variables, health checks, Atlas network access, and troubleshooting.

## License

Private / ISC (see `backend/package.json` where applicable).
