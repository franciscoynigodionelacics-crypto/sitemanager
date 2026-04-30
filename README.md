# HopeCard — Microservices Platform

A donation platform built as a NestJS microservices monorepo. The Next.js frontend communicates exclusively with an API Gateway, which routes requests to dedicated domain services.

## Architecture

```
Frontend (Next.js :3001)
    │
    ▼
API Gateway (:3000)  ←── JWT validation
    │
    ├──► auth-service     (:3100)   /auth/*
    ├──► campaign-service (:3200)   /campaigns
    ├──► cart-service     (:3300)   /cart
    ├──► payment-service  (:3400)   /purchases
    └──► profile-service  (:3500)   /profile, /impact
```

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, React Native Web
- **Services:** NestJS 10, TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (JWT)
- **Infrastructure:** Docker, Docker Compose, GitHub Actions

---

## Running with Docker Compose (recommended)

### 1. Clone the repository

```bash
git clone <repo-url>
cd sitemanager
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project.supabase.co

# Only required for OTP email (forgot password flow)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Hopecard
```

### 3. Start all services

```bash
docker-compose up --build
```

This starts all 7 services. Once running:

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| API Gateway | http://localhost:3000 |
| Auth Service | http://localhost:3100 |
| Campaign Service | http://localhost:3200 |
| Cart Service | http://localhost:3300 |
| Payment Service | http://localhost:3400 |
| Profile Service | http://localhost:3500 |

---

## Running locally (without Docker)

Requires **Node.js 20+** and **npm 10+**.

### 1. Install all workspace dependencies

```bash
npm install
```

### 2. Build the shared library

```bash
cd libs/shared && npm run build && cd ../..
```

### 3. Set environment variables for each service

Copy `.env.example` to `.env` at the root, then create `.env.local` inside `apps/frontend/`:

```bash
cp .env.example .env
cp apps/frontend/.env.local.example apps/frontend/.env.local  # if it exists, else create manually
```

`apps/frontend/.env.local` needs:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

### 4. Start each service in a separate terminal

```bash
# Terminal 1 — Auth Service
cd apps/auth-service && npm install && npm run start:dev

# Terminal 2 — Campaign Service
cd apps/campaign-service && npm install && npm run start:dev

# Terminal 3 — Cart Service
cd apps/cart-service && npm install && npm run start:dev

# Terminal 4 — Payment Service
cd apps/payment-service && npm install && npm run start:dev

# Terminal 5 — Profile Service
cd apps/profile-service && npm install && npm run start:dev

# Terminal 6 — API Gateway (start after all services are up)
cd apps/api-gateway && npm install && npm run start:dev

# Terminal 7 — Frontend
cd apps/frontend && npm install && npm run dev
```

Open http://localhost:3001 in your browser.

---

## Project Structure

```
sitemanager/
  apps/
    api-gateway/          # NestJS — JWT validation + request proxying
    auth-service/         # NestJS — login, signup, OTP, password, upload-id
    campaign-service/     # NestJS — campaign listing and filtering
    cart-service/         # NestJS — cart CRUD
    payment-service/      # NestJS — hopecard purchases
    profile-service/      # NestJS — donor profile and impact stats
    frontend/             # Next.js — donor-facing UI
  libs/
    shared/               # Supabase helpers and shared TypeScript types
  docker-compose.yml
  .env.example
```

---

## CI/CD

Each service has an independent GitHub Actions pipeline triggered only when its own files change. Changing `cart-service` does not trigger the `auth-service` pipeline.

| Workflow | Trigger path |
|---|---|
| `ci-api-gateway.yml` | `apps/api-gateway/**` |
| `ci-auth-service.yml` | `apps/auth-service/**` |
| `ci-campaign-service.yml` | `apps/campaign-service/**`, `libs/shared/**` |
| `ci-cart-service.yml` | `apps/cart-service/**`, `libs/shared/**` |
| `ci-payment-service.yml` | `apps/payment-service/**`, `libs/shared/**` |
| `ci-profile-service.yml` | `apps/profile-service/**`, `libs/shared/**` |
| `ci-frontend.yml` | `apps/frontend/**` |

Each pipeline runs lint → build → Docker image build.

---

## Running Tests

```bash
# Shared library unit tests
cd libs/shared && npm test
```
