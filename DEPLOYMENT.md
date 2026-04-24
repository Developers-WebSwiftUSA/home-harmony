# Deploy Home Harmony on Render + MongoDB Atlas

This project is configured for **one [Render](https://render.com) Web Service**: the build produces `frontend/dist`, and **Express** serves both the React SPA and **`/api`** on the same public URL. You only need **Render** and **[MongoDB Atlas](https://www.mongodb.com/atlas)**—no separate static host or CDN is required for the default setup.

| File | Role |
|------|------|
| [`render.yaml`](./render.yaml) | Render **Blueprint** (service type, build/start commands, non-secret env defaults) |
| [Root `package.json`](./package.json) | `render:build` and `render:start` scripts used by Render |

---

## Prerequisites

1. **MongoDB Atlas** — cluster created, database user with read/write to your DB, **connection string** (`mongodb+srv://...`) copied.
2. **Network Access** in Atlas — allow the application to connect:
   - **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`) is the usual choice on Render’s **free** tier because outbound IPs are not fixed.
3. **Git repository** pushed to GitHub/GitLab/Bitbucket (Render connects to it).

---

## Option A — Deploy with a Blueprint (recommended)

1. In the Render dashboard: **New** → **Blueprint**.
2. Connect this repository and confirm **`render.yaml`** is detected.
3. Adjust in the YAML if needed:
   - `name:` (service name, must be unique on your account)
   - `region:` (e.g. `oregon`, `frankfurt`)
   - `plan:` (e.g. `free` or `starter`)
4. Create the Blueprint. When the first deploy is queued, open the **Web Service** → **Environment**.
5. Set **secret** variables (not committed to git):
   - **`MONGODB_URI`** — full Atlas SRV URI with user, password, and database name.
   - **`JWT_SECRET`** — long random string (example: `openssl rand -hex 32`).
6. Optional:
   - **`FRONTEND_URL`** — your public site URL, e.g. `https://<service-name>.onrender.com` or your custom domain. CORS and Socket.IO also allow **`RENDER_EXTERNAL_URL`**, which Render sets automatically.

**Health check:** Render should call **`GET /api/health`** (already set in `render.yaml`).

---

## Option B — Manual Web Service

Create **New** → **Web Service**, connect the repo, then set:

| Setting | Value |
|---------|--------|
| **Root directory** | *(empty — repository root)* |
| **Environment** | **Node** |
| **Build command** | `npm run render:build` |
| **Start command** | `npm run render:start` |
| **Health check path** | `/api/health` |

Add the same environment variables as in the Blueprint section above.

Render injects **`PORT`** and **`RENDER_EXTERNAL_URL`**. Do **not** set `PORT` manually unless you know what you are doing.

---

## Environment variables reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | Yes for production | Set to `production` |
| `MONGODB_URI` | Yes | Atlas connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs |
| `JWT_EXPIRE` | No | Default `7d` in `render.yaml` |
| `VITE_API_URL` | Strongly recommended | Use **`/api`** so the browser talks to the **same** host as the UI (set at **build** time on Render) |
| `FRONTEND_URL` | Optional | Public URL for links / consistency; CORS also allows `RENDER_EXTERNAL_URL` |

**Build vs runtime:** Render exposes the same variables to **build** and **runtime** by default. The frontend `postbuild` seed script uses `MONGODB_URI` during the image build; if it is missing, the seed skips safely.

---

## What the Render scripts do

| Command | Behavior |
|---------|----------|
| `npm run render:build` | `npm ci` in `frontend` → `npm run build` (Vite → `frontend/dist`, including `postbuild` super-admin seed) → `npm install --prefix backend --omit=dev` → `node --check backend/server.js` |
| `npm run render:start` | `node backend/server.js` — API under `/api`, static files from `frontend/dist` when present |

Local equivalent after a clean clone: `npm run serve:production`.

---

## After deploy

- Open **`RENDER_EXTERNAL_URL`** (or your custom domain) in a browser.
- Confirm **`/api/health`** returns JSON.
- Log in with an admin account (use **`npm run seed:superadmin`** locally against Atlas first, or rely on the postbuild seed if `MONGODB_URI` was available during build).

---

## Super-admin seed

The frontend **`postbuild`** hook runs `backend/scripts/seedSuperAdmin.mjs`. It uses **`MONGODB_URI`** from the environment and **exits successfully** if the database is unreachable (so builds do not fail in CI). To create the bootstrap admin on Render, ensure **`MONGODB_URI`** is available during the **build** phase.

---

## File uploads

Render’s filesystem is **ephemeral**. Files saved under `backend/uploads` can disappear on redeploy or instance move. For production-grade media, plan object storage (e.g. S3-compatible) later; for smoke testing, local uploads may be enough.

---

## Custom domain (Render only)

**Settings** → **Custom Domains** on the Web Service. Follow Render’s DNS instructions. If you bake public URLs anywhere, set **`FRONTEND_URL`** to the custom domain and trigger a **redeploy** after changing **`VITE_API_URL`**-dependent behavior.

---

## Troubleshooting

| Symptom | Things to verify |
|---------|------------------|
| CORS or Socket.IO failures | `FRONTEND_URL` matches your browser origin, or rely on **`RENDER_EXTERNAL_URL`** (allowed in server CORS config). |
| API calls 404 or wrong host | Rebuild with **`VITE_API_URL=/api`** for same-origin hosting. |
| `npm ci` fails on Render | `frontend/package-lock.json` is committed; Node version (`.node-version` → **20**). |
| MongoDB connection errors | Atlas **Network Access**, user/password in URI, cluster not paused. |

---

## Advanced: SPA and API on different hosts

If the UI is ever built for a **different origin** than the API, set **`VITE_API_URL`** at build time to the full API base (e.g. `https://api.example.com/api`) and set backend **`FRONTEND_URL`** to the SPA origin for CORS. The default documented setup is **one Render service, one URL**.
