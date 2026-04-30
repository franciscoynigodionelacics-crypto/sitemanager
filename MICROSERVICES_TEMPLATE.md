# No-Docker NestJS Microservices — Replication Guide

A step-by-step guide to replicate this project's microservices architecture in any new system. Each service runs as an independent Node.js process. The frontend discovers the backend via a written JSON file. No Docker, no orchestrator.

---

## Core Concepts

- **Each service** is a standalone NestJS HTTP server with its own port.
- **A Gateway service** sits in front and proxies requests to the correct service based on URL prefix.
- **Shared code** (constants, guards, utilities) lives in a `shared/` folder inside the backend, imported via TypeScript path aliases.
- **Frontend** discovers the gateway's port from `public/backend-info.json` written at runtime.
- **`concurrently`** starts all services together with a single `npm run dev`.

---

## Directory Structure to Replicate

```
your-project/
├── src/                          # Frontend (Next.js or any framework)
│   └── app/
│       └── api/                  # Frontend API proxy routes
├── backend/
│   ├── services/
│   │   ├── gateway/src/main.ts   # API Gateway — proxy router
│   │   ├── auth/src/             # Auth service
│   │   │   ├── main.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── [service-name]/src/   # One folder per domain
│   │   │   ├── main.ts
│   │   │   ├── [name].module.ts
│   │   │   ├── [name].controller.ts
│   │   │   └── [name].service.ts
│   │   └── ...
│   ├── shared/
│   │   ├── constants.ts          # Service port map
│   │   ├── port-finder.ts        # Auto port selection
│   │   ├── http-exception.filter.ts
│   │   ├── jwt.guard.ts
│   │   └── supabaseClient.ts     # (or your DB client)
│   ├── package.json
│   └── tsconfig.json
├── public/
│   └── backend-info.json         # Written at gateway startup
├── package.json                  # Root — runs both frontend + backend
└── scripts/
    └── check-env.js
```

---

## Step 1 — Define Your Services

Before writing any code, map your domain into services. Each service owns one domain.

| Service | Port | Handles |
|---------|------|---------|
| gateway | 5000 | Proxy routing only — no business logic |
| auth | 5001 | Login, logout, JWT, OTP |
| [domain-a] | 5002 | e.g. users, products, orders |
| [domain-b] | 5003 | e.g. payments, approvals |
| analytics | 5004 | Dashboard stats, activity logs |

Rules:
- Services **do not call each other over HTTP** unless absolutely required.
- Each service connects directly to the shared database.
- The gateway is the **only** entry point for the frontend.

---

## Step 2 — Shared Constants (`backend/shared/constants.ts`)

```typescript
export const SERVICE_PORTS = {
  GATEWAY: 5000,
  AUTH: 5001,
  DOMAIN_A: 5002,
  DOMAIN_B: 5003,
  ANALYTICS: 5004,
  ANALYTICS_TCP: 5005, // only if you need TCP inter-service messaging
};

export const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
```

---

## Step 3 — Port Finder (`backend/shared/port-finder.ts`)

This lets a service auto-select the next available port if its default is taken. Copy this exactly.

```typescript
import * as net from 'net';

export async function findAvailablePort(startPort: number): Promise<number> {
  for (let port = startPort; port < startPort + 10; port++) {
    const available = await isPortAvailable(port);
    if (available) return port;
  }
  throw new Error(`No available port found between ${startPort} and ${startPort + 9}`);
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => { server.close(); resolve(true); });
    server.listen(port);
  });
}
```

---

## Step 4 — Each Service's `main.ts`

Every service (except gateway) follows this identical pattern. Only the module name and port constant change.

```typescript
// backend/services/[name]/src/main.ts
import { NestFactory } from '@nestjs/core';
import { YourModule } from './your.module';
import { SERVICE_PORTS } from '@shared/constants';
import { findAvailablePort } from '@shared/port-finder';
import { HttpExceptionFilter } from '@shared/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(YourModule);
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = await findAvailablePort(SERVICE_PORTS.YOUR_SERVICE);
  await app.listen(port, '0.0.0.0');
  console.log(`\n✅ YourService running on port ${port}`);
}

bootstrap();
```

---

## Step 5 — The Gateway (`backend/services/gateway/src/main.ts`)

The gateway is a single NestJS controller with `@All()` catch-all routes. It proxies by URL prefix. It also writes `backend-info.json` so the frontend knows which port to call.

```typescript
import { NestFactory } from '@nestjs/core';
import { Module, Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
const httpProxy = require('express-http-proxy');
import { SERVICE_PORTS } from '@shared/constants';
import { findAvailablePort } from '@shared/port-finder';

@Controller()
export class GatewayController {
  private createProxy(target: string) {
    return httpProxy(target, {
      proxyReqPathResolver: (req: Request) => req.originalUrl.replace(/^\/api/, ''),
    });
  }

  // One proxy instance per downstream service
  private authProxy      = this.createProxy(`http://127.0.0.1:${SERVICE_PORTS.AUTH}`);
  private domainAProxy   = this.createProxy(`http://127.0.0.1:${SERVICE_PORTS.DOMAIN_A}`);
  private domainBProxy   = this.createProxy(`http://127.0.0.1:${SERVICE_PORTS.DOMAIN_B}`);
  private analyticsProxy = this.createProxy(`http://127.0.0.1:${SERVICE_PORTS.ANALYTICS}`);

  // Route by URL prefix — add one @All block per service
  @All('auth/*') handleAuth(@Req() req: Request, @Res() res: Response) {
    this.authProxy(req, res);
  }

  @All('domain-a*') handleDomainA(@Req() req: Request, @Res() res: Response) {
    this.domainAProxy(req, res);
  }

  @All('domain-b*') handleDomainB(@Req() req: Request, @Res() res: Response) {
    this.domainBProxy(req, res);
  }

  @All('dashboard*') handleDashboard(@Req() req: Request, @Res() res: Response) {
    this.analyticsProxy(req, res);
  }

  @All('health') handleHealth(@Req() _req: Request, @Res() res: Response) {
    res.status(200).send({ status: 'Gateway OK' });
  }
}

@Module({ controllers: [GatewayController] })
class GatewayModule {}

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  const port = await findAvailablePort(SERVICE_PORTS.GATEWAY);
  await app.listen(port, '0.0.0.0');
  writeBackendInfo(port);
  console.log(`\n🚀 Gateway running on port ${port}`);
}

function writeBackendInfo(port: number): void {
  try {
    // Adjust this path depth to match your folder structure
    const dest = path.resolve(__dirname, '../../../../public/backend-info.json');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, JSON.stringify({
      port,
      url: `http://127.0.0.1:${port}`,
      timestamp: new Date().toISOString(),
    }, null, 2));
  } catch (e) {
    console.warn('Could not write backend-info.json:', e);
  }
}

bootstrap();
```

**The `path.resolve(__dirname, '../../../../public/...')` depth must match how deep `main.ts` is** from the project root. Count the folders: `services/gateway/src/` = 3 levels inside `backend/`, and `backend/` is 1 level from root = 4 `../` total.

---

## Step 6 — TypeScript Path Aliases (`backend/tsconfig.json`)

This makes `@shared/constants` work across all services.

```json
{
  "ts-node": {
    "compilerOptions": { "module": "commonjs" }
  },
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "lib": ["ES2021"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./",
    "paths": {
      "@shared/*": ["shared/*"]
    }
  },
  "include": ["services/**/*", "shared/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Step 7 — Backend `package.json` Scripts

```json
{
  "scripts": {
    "dev": "npm run dev:all",
    "dev:all": "concurrently \"npm run dev:gateway\" \"npm run dev:auth\" \"npm run dev:domain-a\" \"npm run dev:domain-b\" \"npm run dev:analytics\"",
    "dev:gateway":  "ts-node -r tsconfig-paths/register services/gateway/src/main.ts",
    "dev:auth":     "ts-node -r tsconfig-paths/register services/auth/src/main.ts",
    "dev:domain-a": "ts-node -r tsconfig-paths/register services/domain-a/src/main.ts",
    "dev:domain-b": "ts-node -r tsconfig-paths/register services/domain-b/src/main.ts",
    "dev:analytics":"ts-node -r tsconfig-paths/register services/analytics/src/main.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.x",
    "@nestjs/core": "^10.x",
    "@nestjs/microservices": "^10.x",
    "@nestjs/platform-express": "^10.x",
    "express-http-proxy": "^2.x",
    "reflect-metadata": "^0.1.x",
    "rxjs": "^7.x"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.x",
    "concurrently": "^9.x",
    "ts-node": "^10.x",
    "tsconfig-paths": "^4.x",
    "typescript": "^5.x"
  }
}
```

---

## Step 8 — Root `package.json` (Frontend + Backend Together)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "next dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "next build",
    "build:backend": "cd backend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^9.x"
  }
}
```

---

## Step 9 — Frontend: Reading `backend-info.json`

The gateway writes its port to `public/backend-info.json` at startup. The frontend reads this file to know where to send API calls.

```typescript
// lib/api.ts (or wherever you configure your fetch base URL)
import backendInfo from '@/public/backend-info.json'; // static import, or fetch at runtime

export const API_BASE = backendInfo?.url ?? 'http://127.0.0.1:5000';

export async function apiCall(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}/api${path}`, options);
  return res.json();
}
```

Or read it dynamically via a Next.js API route:

```typescript
// src/app/api/config/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'backend-info.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return NextResponse.json(data);
}
```

---

## Step 10 — Exception Filter (`backend/shared/http-exception.filter.ts`)

Apply this globally in every service's `main.ts` via `app.useGlobalFilters(new HttpExceptionFilter())`.

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();
    const message = typeof body === 'object' ? (body as any).message : body;

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
    });
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const message = exception instanceof Error ? exception.message : 'Internal server error';
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, statusCode: 500, message });
  }
}
```

---

## Checklist for Adding a New Service

1. Create `backend/services/[name]/src/` with `main.ts`, `[name].module.ts`, `[name].controller.ts`, `[name].service.ts`
2. Add the port to `backend/shared/constants.ts` → `SERVICE_PORTS.[NAME]: XXXX`
3. Add the proxy instance and `@All('[prefix]*')` route in `gateway/src/main.ts`
4. Add `"dev:[name]": "ts-node -r tsconfig-paths/register services/[name]/src/main.ts"` to `backend/package.json`
5. Add `"npm run dev:[name]"` to the `dev:all` `concurrently` command

---

## What This Pattern Is NOT

- Not a message-broker pattern (no RabbitMQ, Kafka, Redis pub/sub). Services don't emit events to each other.
- Not containerized. All services run as processes on the same machine.
- Not load-balanced. One instance per service.
- Not independently deployable to separate servers without modification.

This is best described as a **process-isolated monorepo** — microservices separation of concerns without infrastructure overhead. It's ideal for admin tools, internal dashboards, and projects where one developer or a small team manages everything on a single machine or VM.
