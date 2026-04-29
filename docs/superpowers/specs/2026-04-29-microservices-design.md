# Microservices Architecture Design

**Date:** 2026-04-29  
**Project:** sitemanager (HopeCard Platform)  
**Driver:** CI/CD compliance requires microservices architecture before merging  

---

## 1. Overview

Transform the current Next.js full-stack monolith into a NestJS microservices monorepo. The frontend (Next.js) is preserved intact with only its fetch URLs updated. All business logic is migrated as-is into dedicated NestJS services — no logic changes, only structural reorganization.

---

## 2. Monorepo Structure

```
sitemanager/
  apps/
    frontend/            # Next.js app (moved from root)
    api-gateway/         # NestJS — single public HTTP entry point
    auth-service/        # NestJS — authentication domain
    campaign-service/    # NestJS — campaign domain
    cart-service/        # NestJS — cart domain
    payment-service/     # NestJS — payment/purchase domain
    profile-service/     # NestJS — profile and impact domain
  libs/
    shared/              # shared TypeScript types + Supabase helpers
  docker-compose.yml
  package.json           # npm workspaces root
  .env                   # shared environment variables
```

Each `apps/*` entry has its own `package.json`, `tsconfig.json`, `Dockerfile`, and GitHub Actions workflow.

---

## 3. Service Responsibilities

| Service | Port | Domain | Migrated From |
|---|---|---|---|
| `api-gateway` | 3000 | JWT validation, request proxying | new |
| `auth-service` | 3100 | login, signup, OTP, password reset, upload-id | `app/api/auth/*` |
| `campaign-service` | 3200 | campaign listing, category filtering | `app/api/campaigns` |
| `cart-service` | 3300 | cart CRUD, cart items, fee calculation | `app/api/cart` |
| `payment-service` | 3400 | hopecard purchases, payment processing | `app/api/hopecard-purchases` |
| `profile-service` | 3500 | donor profile CRUD, impact stats, donation history | `app/api/profile`, `app/api/impact` |
| `frontend` | 3001 | Next.js UI | root `app/` |

---

## 4. Communication & API Gateway

The API Gateway is the **only** public-facing entry point. The frontend calls exclusively the gateway — never individual services directly.

```
Frontend (Next.js :3001)
    │
    ▼
API Gateway (:3000)  ←── validates Supabase JWT, injects x-user-id header
    │
    ├──► auth-service     (:3100)   /auth/*
    ├──► campaign-service (:3200)   /campaigns
    ├──► cart-service     (:3300)   /cart
    ├──► payment-service  (:3400)   /purchases
    └──► profile-service  (:3500)   /profile, /impact
```

**Auth propagation:** The gateway validates the Supabase JWT from the `Authorization` header, extracts the user ID, and forwards it as an `x-user-id` header to downstream services. Services trust this header and do not re-validate the token. Public routes (`/auth/*`) bypass JWT validation entirely.

**Inter-service transport:** HTTP/REST. Each service is a standard NestJS HTTP app. The gateway uses NestJS `HttpModule` to proxy requests.

---

## 5. Database Strategy

All services share the **same Supabase instance** via the existing `supabaseRequest()` helper. There is no per-service database split. This avoids data migration entirely while achieving full separation at the code and deployment level — which satisfies the microservices compliance requirement.

---

## 6. Shared Library (`libs/shared`)

Exported by `@sitemanager/shared`:

- `supabaseRequest<T>(path, init?)` — migrated from `lib/hopecard-supabase.ts`
- `getStorageUrl(bucket, key)` — migrated from `lib/storage-url.ts`
- `getSupabaseConfig()` — migrated from `lib/hopecard-supabase.ts`
- Common TypeScript interfaces: `DbProfile`, `DbCart`, `DbCartItem`, `DbCampaign`, `DbPurchase`

---

## 7. Frontend Changes

- Move `app/`, `components/`, `lib/`, `public/` into `apps/frontend/`
- Remove `apps/frontend/app/api/` entirely — no more Next.js API routes
- Update all `fetch('/api/...')` calls to use `process.env.NEXT_PUBLIC_API_GATEWAY_URL` (e.g. `http://localhost:3000` locally, overridable per environment)
- Update `next.config.ts` as needed for the new location

---

## 8. Docker & Docker Compose

Each service has a multi-stage `Dockerfile`:

```dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Stage 2: production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main"]
```

`docker-compose.yml` at root defines all 7 services. Environment variables (Supabase URL/keys) are passed from a root `.env` file.

---

## 9. CI/CD Pipelines

One GitHub Actions workflow file per service under `.github/workflows/`:

- `ci-api-gateway.yml`
- `ci-auth-service.yml`
- `ci-campaign-service.yml`
- `ci-cart-service.yml`
- `ci-payment-service.yml`
- `ci-profile-service.yml`
- `ci-frontend.yml`

Each workflow:
1. Triggers on `push`/`pull_request` with path filter `apps/<service-name>/**`
2. Runs: `npm ci` → `npm run lint` → `npm run build`
3. Builds Docker image (tagged with commit SHA)

Changing one service only triggers its own pipeline — independent deployability is demonstrated in CI.

---

## 10. Migration Constraints

- No data loss: Supabase schema is unchanged; only application code moves
- No feature loss: all existing API route logic is migrated verbatim into NestJS controllers/services
- No breaking API contract changes: URL paths are preserved (gateway routes match existing `/api/*` paths minus the `/api` prefix)
- The `hopecard-session.ts` lib is reviewed and migrated to the appropriate service if still used
