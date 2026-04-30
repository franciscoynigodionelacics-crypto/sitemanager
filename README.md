# HopeCard — Microservices Platform

A donation platform built as a NestJS microservices backend + Next.js frontend. All services run as independent Node.js processes. No Docker required.

## Architecture

```
Frontend (Next.js :3001)
    │
    ▼
API Gateway (:5000)  ←── /api/* prefix, JWT validation
    │
    ├──► auth-service     (:5001)   /api/auth/*
    ├──► campaigns-service(:5002)   /api/campaigns
    ├──► cart-service     (:5003)   /api/cart
    ├──► purchases-service(:5004)   /api/purchases
    └──► profile-service  (:5005)   /api/profile, /api/impact
```

- The gateway is the only public entry point. Frontend never calls services directly.
- Gateway validates Supabase JWT on all routes except `/api/auth/*`.
- Services share one Supabase instance — no per-service database.
- Gateway writes `apps/frontend/public/backend-info.json` at startup with its actual port.
- `concurrently` starts all 6 backend services with a single `npm run dev:backend`.

## Tech Stack

- **Frontend:** Next.js (App Router), React
- **Backend:** NestJS 10, TypeScript, ts-node
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (JWT)
- **Dev runner:** concurrently + tsconfig-paths

---

## Running Locally

### 1. Install dependencies

```bash
# Root (concurrently for launching frontend + backend together)
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd apps/frontend && npm install && cd ../..
```

### 2. Environment variables

The root `.env.local` is pre-configured. If you need to change values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_API_GATEWAY_URL=http://127.0.0.1:5000

# Only required for OTP email (forgot password flow)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Hopecard
```

### 3. Start everything

```bash
npm run dev
```

This starts all 7 processes (6 backend services + 1 frontend) concurrently.

| Service | Default Port |
|---|---|
| Frontend | http://localhost:3001 |
| API Gateway | http://127.0.0.1:5000 |
| Auth Service | http://127.0.0.1:5001 |
| Campaigns Service | http://127.0.0.1:5002 |
| Cart Service | http://127.0.0.1:5003 |
| Purchases Service | http://127.0.0.1:5004 |
| Profile Service | http://127.0.0.1:5005 |

Ports auto-increment if the default is taken (e.g., if 5000 is busy, gateway picks 5001).

### Running frontend and backend separately

```bash
# Terminal 1 — all backend services
npm run dev:backend

# Terminal 2 — frontend
npm run dev:frontend
```

---

## Project Structure

```
sitemanager/
  apps/
    frontend/             # Next.js — donor-facing UI
  backend/
    services/
      gateway/src/        # NestJS — JWT validation + request proxying
      auth/src/           # NestJS — login, signup, OTP, password, upload-id
      campaigns/src/      # NestJS — campaign listing and filtering
      cart/src/           # NestJS — cart CRUD
      purchases/src/      # NestJS — hopecard purchases
      profile/src/        # NestJS — donor profile and impact stats
    shared/               # Shared TypeScript code (path aliased as @shared/*)
      constants.ts        # Service port map
      port-finder.ts      # Auto port selection
      http-exception.filter.ts
      supabase.ts         # supabaseRequest() helper
      storage.ts          # getStorageUrl() helper
      types.ts            # DB interfaces
    package.json          # Single backend package (all services share deps)
    tsconfig.json         # @shared/* path alias
  .env.local              # Shared environment variables
  package.json            # Root — runs frontend + backend via concurrently
```

### Adding a new service

1. Create `backend/services/[name]/src/` with `main.ts`, `[name].module.ts`, `[name].controller.ts`, `[name].service.ts`
2. Add the port to `backend/shared/constants.ts` → `SERVICE_PORTS.[NAME]: XXXX`
3. Add proxy instance and `@All('[prefix]*')` route in `backend/services/gateway/src/main.ts`
4. Add `"dev:[name]": "ts-node -r tsconfig-paths/register services/[name]/src/main.ts"` to `backend/package.json`
5. Add `"npm run dev:[name]"` to the `dev` concurrently command in `backend/package.json`

---

## CI/CD

Each service has an independent GitHub Actions pipeline triggered only when its own files change.

| Workflow | Trigger path |
|---|---|
| `ci-gateway.yml` | `backend/services/gateway/**`, `backend/shared/**` |
| `ci-auth.yml` | `backend/services/auth/**`, `backend/shared/**` |
| `ci-campaigns.yml` | `backend/services/campaigns/**`, `backend/shared/**` |
| `ci-cart.yml` | `backend/services/cart/**`, `backend/shared/**` |
| `ci-purchases.yml` | `backend/services/purchases/**`, `backend/shared/**` |
| `ci-profile.yml` | `backend/services/profile/**`, `backend/shared/**` |
| `ci-frontend.yml` | `apps/frontend/**` |
