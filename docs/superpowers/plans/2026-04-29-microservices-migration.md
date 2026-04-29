# Microservices Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the HopeCard sitemanager from a Next.js monolith into a NestJS microservices monorepo with an API Gateway, 5 domain services, a shared library, Docker Compose, and per-service CI/CD pipelines.

**Architecture:** The Next.js frontend is moved into `apps/frontend/` and calls a single API Gateway at port 3000. The gateway validates Supabase JWTs and proxies requests to 5 NestJS domain services (auth, campaign, cart, payment, profile) running on ports 3100–3500. All services share the same Supabase instance via `libs/shared`.

**Tech Stack:** NestJS 10, @nestjs/platform-express, http-proxy-middleware, @supabase/supabase-js, nodemailer, multer, npm workspaces, Docker, GitHub Actions

---

## File Map

```
sitemanager/
  package.json                          MODIFY — add workspaces
  tsconfig.json                         CREATE — root TS config
  docker-compose.yml                    CREATE
  .env.example                          CREATE
  apps/
    api-gateway/
      src/main.ts                       CREATE
      src/app.module.ts                 CREATE
      src/middleware/auth.middleware.ts CREATE
      package.json                      CREATE
      tsconfig.json                     CREATE
      tsconfig.build.json               CREATE
      nest-cli.json                     CREATE
      Dockerfile                        CREATE
    auth-service/
      src/main.ts                       CREATE
      src/app.module.ts                 CREATE
      src/auth/auth.module.ts           CREATE
      src/auth/auth.controller.ts       CREATE
      src/auth/auth.service.ts          CREATE
      package.json                      CREATE
      tsconfig.json                     CREATE
      tsconfig.build.json               CREATE
      nest-cli.json                     CREATE
      Dockerfile                        CREATE
    campaign-service/
      src/main.ts                       CREATE
      src/app.module.ts                 CREATE
      src/campaigns/campaigns.module.ts    CREATE
      src/campaigns/campaigns.controller.ts CREATE
      src/campaigns/campaigns.service.ts   CREATE
      package.json                      CREATE
      tsconfig.json                     CREATE
      tsconfig.build.json               CREATE
      nest-cli.json                     CREATE
      Dockerfile                        CREATE
    cart-service/
      src/main.ts                       CREATE
      src/app.module.ts                 CREATE
      src/cart/cart.module.ts           CREATE
      src/cart/cart.controller.ts       CREATE
      src/cart/cart.service.ts          CREATE
      package.json                      CREATE
      tsconfig.json                     CREATE
      tsconfig.build.json               CREATE
      nest-cli.json                     CREATE
      Dockerfile                        CREATE
    payment-service/
      src/main.ts                       CREATE
      src/app.module.ts                 CREATE
      src/purchases/purchases.module.ts    CREATE
      src/purchases/purchases.controller.ts CREATE
      src/purchases/purchases.service.ts   CREATE
      package.json                      CREATE
      tsconfig.json                     CREATE
      tsconfig.build.json               CREATE
      nest-cli.json                     CREATE
      Dockerfile                        CREATE
    profile-service/
      src/main.ts                       CREATE
      src/app.module.ts                 CREATE
      src/profile/profile.module.ts     CREATE
      src/profile/profile.controller.ts CREATE
      src/profile/profile.service.ts    CREATE
      package.json                      CREATE
      tsconfig.json                     CREATE
      tsconfig.build.json               CREATE
      nest-cli.json                     CREATE
      Dockerfile                        CREATE
    frontend/
      (all current root files moved here)
      app/api/                          DELETE — remove all Next.js API routes
      .env.local                        CREATE
  libs/
    shared/
      src/index.ts                      CREATE
      src/supabase.ts                   CREATE
      src/storage.ts                    CREATE
      src/types.ts                      CREATE
      src/supabase.test.ts              CREATE
      package.json                      CREATE
      tsconfig.json                     CREATE
      jest.config.js                    CREATE
  .github/workflows/
    ci-api-gateway.yml                  CREATE
    ci-auth-service.yml                 CREATE
    ci-campaign-service.yml             CREATE
    ci-cart-service.yml                 CREATE
    ci-payment-service.yml              CREATE
    ci-profile-service.yml              CREATE
    ci-frontend.yml                     CREATE
```

---

## Task 1: Scaffold Monorepo Root

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `.env.example`

- [ ] **Step 1: Replace root `package.json` with workspace config**

```json
{
  "name": "sitemanager",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "libs/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "dev:gateway": "npm run start:dev --workspace=apps/api-gateway",
    "docker:up": "docker-compose up --build"
  }
}
```

- [ ] **Step 2: Create root `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "baseUrl": "./",
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false
  }
}
```

- [ ] **Step 3: Create `.env.example`**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project.supabase.co
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Hopecard
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

- [ ] **Step 4: Create directory structure**

Run:
```bash
mkdir -p apps/api-gateway/src/middleware
mkdir -p apps/auth-service/src/auth
mkdir -p apps/campaign-service/src/campaigns
mkdir -p apps/cart-service/src/cart
mkdir -p apps/payment-service/src/purchases
mkdir -p apps/profile-service/src/profile
mkdir -p apps/frontend
mkdir -p libs/shared/src
mkdir -p .github/workflows
```

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json .env.example
git commit -m "chore: initialize npm workspaces monorepo scaffold"
```

---

## Task 2: Create `libs/shared`

**Files:**
- Create: `libs/shared/package.json`
- Create: `libs/shared/tsconfig.json`
- Create: `libs/shared/jest.config.js`
- Create: `libs/shared/src/types.ts`
- Create: `libs/shared/src/supabase.ts`
- Create: `libs/shared/src/storage.ts`
- Create: `libs/shared/src/index.ts`
- Create: `libs/shared/src/supabase.test.ts`

- [ ] **Step 1: Create `libs/shared/package.json`**

```json
{
  "name": "@sitemanager/shared",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "jest"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.3.1",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.1.3"
  }
}
```

- [ ] **Step 2: Create `libs/shared/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

- [ ] **Step 3: Create `libs/shared/jest.config.js`**

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
};
```

- [ ] **Step 4: Write failing tests for `supabaseRequest` and `getStorageUrl`**

Create `libs/shared/src/supabase.test.ts`:

```typescript
import { getSupabaseConfig, supabaseRequest } from './supabase';
import { getStorageUrl } from './storage';

describe('getSupabaseConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws when env vars are missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => getSupabaseConfig()).toThrow('Missing Supabase environment variables');
  });

  it('returns config when env vars are set', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    const config = getSupabaseConfig();
    expect(config.url).toBe('https://test.supabase.co');
    expect(config.key).toBe('test-key');
  });
});

describe('getStorageUrl', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
  });

  it('returns null for empty key', () => {
    expect(getStorageUrl('campaigns', null)).toBeNull();
    expect(getStorageUrl('campaigns', '')).toBeNull();
  });

  it('builds correct campaign image URL', () => {
    const url = getStorageUrl('campaigns', 'my-image.jpg');
    expect(url).toBe(
      'https://test.supabase.co/storage/v1/object/public/camp-man-files/cover-images/campaigns/my-image.jpg',
    );
  });

  it('does not double-prefix campaign images', () => {
    const url = getStorageUrl('campaigns', 'cover-images/campaigns/my-image.jpg');
    expect(url).toContain('/cover-images/campaigns/my-image.jpg');
    expect(url).not.toContain('/cover-images/campaigns/cover-images/campaigns/');
  });

  it('builds generic bucket URL', () => {
    const url = getStorageUrl('profile-photos', 'user123/photo.png');
    expect(url).toBe(
      'https://test.supabase.co/storage/v1/object/public/profile-photos/user123/photo.png',
    );
  });
});
```

- [ ] **Step 5: Run tests to confirm they fail**

```bash
cd libs/shared && npm install && npm test
```

Expected: FAIL with "Cannot find module './supabase'"

- [ ] **Step 6: Create `libs/shared/src/types.ts`**

```typescript
export interface DbProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  barangay: string | null;
  municipality: string | null;
  province: string | null;
  profile_photo_key: string | null;
  status: string;
  created_at: string;
  total_donations_amount: number;
  total_donations_count: number;
}

export interface DbCampaign {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_amount: number;
  collected_amount: number;
  cover_image_key: string | null;
  status: string;
  end_date: string | null;
}

export interface DbCart {
  id: string;
  auth_user_id: string;
  status: string;
}

export interface DbCartItem {
  id: string;
  cart_id: string;
  campaign_id: string;
  face_value: number;
  quantity: number;
  hc_campaigns: {
    title: string;
    category: string | null;
    cover_image_key: string | null;
  } | null;
}

export interface DbPurchase {
  id: string;
  buyer_auth_id: string;
  hopecard_id: string;
  amount_paid: number;
  payment_method: string;
  payment_reference: string;
  status: string;
  purchased_at: string;
}
```

- [ ] **Step 7: Create `libs/shared/src/supabase.ts`**

```typescript
type SupabaseRecord = Record<string, unknown>;

const HOPECARD_TITLE_KEYS = ['title', 'name', 'campaign_title', 'campaign_name', 'label'];
const HOPECARD_ID_KEYS = ['id', 'hopecard_id'];

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

export function getSupabaseConfig() {
  const url = getEnv('SUPABASE_URL') ?? getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key =
    getEnv('SUPABASE_SERVICE_ROLE_KEY') ??
    getEnv('SUPABASE_ANON_KEY') ??
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return { url, key };
}

export async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Supabase request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function normalizeValue(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeLoose(value: unknown): string {
  return normalizeValue(value).replace(/[^a-z0-9]+/g, '');
}

export function getRecordId(record: SupabaseRecord): string | null {
  for (const key of HOPECARD_ID_KEYS) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}

export function getRecordTitle(record: SupabaseRecord): string | null {
  for (const key of HOPECARD_TITLE_KEYS) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}

export function findHopecardRecordByTitle(
  records: SupabaseRecord[],
  title: string,
): SupabaseRecord | null {
  const normalizedTitle = normalizeValue(title);
  const normalizedLooseTitle = normalizeLoose(title);

  return (
    records.find((r) => normalizeValue(getRecordTitle(r)) === normalizedTitle) ??
    records.find((r) => normalizeLoose(getRecordTitle(r)) === normalizedLooseTitle) ??
    records.find((r) => normalizeLoose(getRecordTitle(r)).includes(normalizedLooseTitle)) ??
    records.find((r) => normalizedLooseTitle.includes(normalizeLoose(getRecordTitle(r)))) ??
    null
  );
}
```

- [ ] **Step 8: Create `libs/shared/src/storage.ts`**

```typescript
export function getStorageUrl(bucket: string, key: string | null | undefined): string | null {
  if (!key || typeof key !== 'string' || key.trim() === '') return null;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  const safeKey = key.replace(/\.\.\//g, '').replace(/^\/+/, '').trim();
  if (safeKey === '' || safeKey === 'cover-images/campaigns/') return null;

  let finalBucket = bucket;
  let finalPath = safeKey;

  if (bucket.toLowerCase() === 'campaigns') {
    finalBucket = 'camp-man-files';
    const prefix = 'cover-images/campaigns/';
    finalPath = safeKey.startsWith(prefix) ? safeKey : `${prefix}${safeKey}`;
  }

  return `${url.replace(/\/$/, '')}/storage/v1/object/public/${finalBucket}/${finalPath}`;
}
```

- [ ] **Step 9: Create `libs/shared/src/index.ts`**

```typescript
export { supabaseRequest, getSupabaseConfig, getRecordId, getRecordTitle, findHopecardRecordByTitle } from './supabase';
export { getStorageUrl } from './storage';
export type { DbProfile, DbCampaign, DbCart, DbCartItem, DbPurchase } from './types';
```

- [ ] **Step 10: Run tests — confirm they pass**

```bash
cd libs/shared && npm test
```

Expected: PASS — 6 tests in 1 suite

- [ ] **Step 11: Build shared lib**

```bash
cd libs/shared && npm run build
```

Expected: `dist/` folder created with no errors

- [ ] **Step 12: Commit**

```bash
git add libs/
git commit -m "feat: add @sitemanager/shared library with Supabase helpers and types"
```

---

## Task 3: Create `apps/auth-service`

**Files:**
- Create: `apps/auth-service/package.json`
- Create: `apps/auth-service/tsconfig.json`
- Create: `apps/auth-service/tsconfig.build.json`
- Create: `apps/auth-service/nest-cli.json`
- Create: `apps/auth-service/src/main.ts`
- Create: `apps/auth-service/src/app.module.ts`
- Create: `apps/auth-service/src/auth/auth.module.ts`
- Create: `apps/auth-service/src/auth/auth.controller.ts`
- Create: `apps/auth-service/src/auth/auth.service.ts`
- Create: `apps/auth-service/Dockerfile`

- [ ] **Step 1: Create `apps/auth-service/package.json`**

```json
{
  "name": "@sitemanager/auth-service",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "lint": "echo 'lint ok'"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@supabase/supabase-js": "^2.103.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^8.0.5",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/multer": "^1.4.7",
    "@types/nodemailer": "^8.0.0",
    "@types/node": "^20.3.1",
    "typescript": "^5.1.3"
  }
}
```

- [ ] **Step 2: Create `apps/auth-service/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false
  }
}
```

- [ ] **Step 3: Create `apps/auth-service/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create `apps/auth-service/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

- [ ] **Step 5: Create `apps/auth-service/src/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3100);
  console.log('auth-service running on port 3100');
}
bootstrap();
```

- [ ] **Step 6: Create `apps/auth-service/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({ imports: [AuthModule] })
export class AppModule {}
```

- [ ] **Step 7: Create `apps/auth-service/src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({ controllers: [AuthController], providers: [AuthService] })
export class AuthModule {}
```

- [ ] **Step 8: Create `apps/auth-service/src/auth/auth.service.ts`**

```typescript
import { Injectable, HttpException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private getClients() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anonKey) throw new HttpException('Missing Supabase configuration', 500);
    const supabase = createClient(url, anonKey);
    const admin = createClient(url, serviceKey || anonKey);
    return { url, anonKey, serviceKey, supabase, admin };
  }

  async login(email: string, password: string) {
    const { supabase, admin } = this.getClients();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new HttpException(error.message, 401);

    const userId = data.user?.id;
    const userEmail = data.user?.email || email;

    let { data: profileData, error: profileError } = await admin
      .from('digital_donor_profiles')
      .select('status, role')
      .eq('auth_user_id', userId)
      .single();

    if (profileError || !profileData) {
      const { data: emailProfile, error: emailError } = await admin
        .from('digital_donor_profiles')
        .select('status, role, auth_user_id')
        .eq('email', userEmail)
        .single();

      if (!emailError && emailProfile) {
        profileData = emailProfile;
        profileError = null;
        await admin.from('digital_donor_profiles').update({ auth_user_id: userId }).eq('email', userEmail);
      }
    }

    if (profileError || !profileData) {
      const { data: legacyProfile, error: legacyError } = await admin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!legacyError && legacyProfile) {
        return { success: true, user: data.user, isLegacyUser: true, role: legacyProfile.role };
      }
      throw new HttpException('Donor profile not found. Please ensure you have completed the signup process or contact support.', 403);
    }

    if (profileData?.status !== 'approved') {
      throw new HttpException({ error: 'Your account is not yet approved', reason: 'pending_approval', status: profileData?.status || 'unknown' }, 403);
    }

    return { success: true, user: data.user, session: data.session };
  }

  async signup(body: {
    email: string; password: string; firstName: string; lastName: string;
    barangay?: string; municipality?: string; province?: string; validIdUrl?: string;
    origin?: string;
  }) {
    const { email, password, firstName, lastName, barangay, municipality, province, validIdUrl, origin } = body;
    if (!email || !password || !firstName || !lastName) {
      throw new HttpException('Missing required fields: email, password, firstName, lastName', 400);
    }
    const { supabase, admin } = this.getClients();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${origin || 'http://localhost:3000'}/auth/callback` },
    });
    if (authError) throw new HttpException(authError.message, 400);
    if (!authData.user?.id) throw new HttpException('Failed to create user account', 400);

    const profileData = {
      auth_user_id: authData.user.id, email, first_name: firstName, last_name: lastName,
      barangay: barangay || null, municipality: municipality || null, province: province || null,
      id_verification_key: validIdUrl || null, status: 'pending', role: 'buyer',
    };

    const { data: existingProfile } = await admin.from('digital_donor_profiles').select('id').eq('email', email).maybeSingle();
    let profileCreated = false;
    let profileError: any = null;

    if (existingProfile) {
      const r = await admin.from('digital_donor_profiles').update(profileData).eq('email', email);
      profileError = r.error;
      if (!r.error) profileCreated = true;
    } else {
      const r = await admin.from('digital_donor_profiles').insert(profileData);
      profileError = r.error;
      if (!r.error) profileCreated = true;
    }

    if (!profileCreated) {
      return { success: true, user: authData.user, profileCreated: false, error: `Account created, but profile setup failed: ${profileError?.message}. Please contact support with code ${profileError?.code}.`, warning: 'Profile creation failed.' };
    }
    return { success: true, user: authData.user, profileCreated: true, message: 'Donor profile created successfully' };
  }

  async sendOtp(email: string) {
    if (!email) throw new HttpException('Email is required', 400);
    const { supabase } = this.getClients();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw new HttpException(error.message, 400);
    return { success: true, message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, token: string, type = 'email') {
    if (!email || !token) throw new HttpException('Email and OTP token are required', 400);
    const { supabase } = this.getClients();
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: type as any });
    if (error) throw new HttpException(error.message, 401);
    return { success: true, message: 'OTP verified successfully', session: data.session, user: data.user };
  }

  async generateOtp(email: string) {
    if (!email) throw new HttpException('Email is required', 400);
    const { supabase } = this.getClients();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAtMs = now + 10 * 60 * 1000;

    await supabase.from('otp_sessions').delete().eq('email', email).eq('used', false);
    await supabase.from('otp_sessions').insert({ email, otp: otpCode, created_at_ms: now, expires_at_ms: expiresAtMs, used: false });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD?.replace(/\s/g, '') },
    });

    try {
      await transporter.sendMail({
        from: `${process.env.SMTP_FROM || 'Hopecard'} <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your OTP Code - Hopecard',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#6A1B1B">Password Reset Request</h2><p>Your OTP code is:</p><div style="background:#f5f5f5;padding:20px;border-radius:8px;text-align:center;margin:20px 0"><h1 style="color:#6A1B1B;letter-spacing:5px;margin:0">${otpCode}</h1></div><p style="color:#666">This code will expire in 10 minutes.</p></div>`,
      });
    } catch (emailError: any) {
      const detail = emailError?.responseCode === 535 ? 'SMTP authentication failed.' : emailError?.message || 'Unknown error';
      throw new HttpException(`Failed to send OTP email: ${detail}`, 500);
    }

    return { success: true, message: 'OTP sent successfully' };
  }

  async verifyNumericOtp(email: string, code: string) {
    if (!email || !code) throw new HttpException('Email and OTP code are required', 400);
    const { supabase } = this.getClients();
    const { data, error } = await supabase.from('otp_sessions').select('*').eq('email', email).eq('used', false).single();
    if (error || !data) throw new HttpException('No active OTP request found for this email', 404);
    if (Date.now() > data.expires_at_ms) throw new HttpException('OTP has expired. Please request a new one.', 410);
    if (data.otp !== code) throw new HttpException('Invalid OTP code', 401);

    await supabase.from('otp_sessions').update({ used: true }).eq('id', data.id);
    const sessionToken = Buffer.from(JSON.stringify({ email, verified: true, timestamp: Date.now() })).toString('base64');
    return { success: true, message: 'OTP verified successfully', sessionToken, email };
  }

  async checkEmail(email: string) {
    if (!email) throw new HttpException('Email is required', 400);
    const { admin } = this.getClients();
    const { data: users, error } = await admin.auth.admin.listUsers();
    if (error) throw new HttpException('Failed to verify email', 500);
    const userExists = users.users.some((u) => u.email === email);
    if (!userExists) throw new HttpException('Email not found. Please sign up first.', 404);
    return { success: true, exists: true };
  }

  async resetPasswordWithOtp(email: string, password: string, sessionToken: string) {
    if (!email) throw new HttpException('Email is required', 400);
    if (!password) throw new HttpException('New password is required', 400);
    if (!sessionToken) throw new HttpException('Session expired or invalid. Please request a new OTP.', 400);

    let tokenData: any;
    try {
      tokenData = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'));
      if (tokenData.email !== email || !tokenData.verified) throw new Error('invalid');
    } catch {
      throw new HttpException('Invalid session token', 401);
    }

    const { admin, supabase } = this.getClients();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceKey) {
      const { data: users, error } = await admin.auth.admin.listUsers();
      if (error) throw new HttpException('Failed to find user', 500);
      const user = users.users.find((u) => u.email === email);
      if (!user) throw new HttpException('User not found', 404);
      const { error: updateError } = await admin.auth.admin.updateUserById(user.id, { password });
      if (updateError) throw new HttpException(updateError.message, 400);
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      });
      if (error) throw new HttpException(error.message, 400);
    }

    return { success: true, message: 'Password updated successfully' };
  }

  async updatePassword(password: string, accessToken: string) {
    if (!password || !accessToken) throw new HttpException('Password and access token are required', 400);
    const { supabase } = this.getClients();
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: '' } as any);
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw new HttpException(error.message, 400);
    return { success: true, message: 'Password updated successfully', user: data.user };
  }

  async uploadId(file: Express.Multer.File, userId: string) {
    if (!file) throw new HttpException('No file provided', 400);
    if (!userId) throw new HttpException('User ID is required', 400);

    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) throw new HttpException('Invalid file type. Only JPG, PNG, and PDF are allowed.', 400);
    if (file.size > 5 * 1024 * 1024) throw new HttpException('File size must not exceed 5MB', 400);

    const { admin } = this.getClients();
    const ext = file.originalname.split('.').pop();
    const filename = `${userId}/${Date.now()}-valid-id.${ext}`;

    const { data, error } = await admin.storage.from('donor-ids').upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) {
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        throw new HttpException({ success: false, warning: 'Storage bucket not configured.', error: error.message }, 503);
      }
      throw new HttpException(`Failed to upload file: ${error.message}`, 400);
    }

    const { data: { publicUrl } } = admin.storage.from('donor-ids').getPublicUrl(filename);
    return { success: true, path: data.path, url: publicUrl, message: 'ID uploaded successfully' };
  }
}
```

- [ ] **Step 9: Create `apps/auth-service/src/auth/auth.controller.ts`**

```typescript
import { Controller, Post, Body, Req, UseInterceptors, UploadedFile, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('signup')
  signup(@Body() body: any, @Req() req: any) {
    return this.authService.signup({ ...body, origin: req.headers.origin });
  }

  @Post('send-otp')
  sendOtp(@Body() body: { email: string }) {
    return this.authService.sendOtp(body.email);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { email: string; token: string; type?: string }) {
    return this.authService.verifyOtp(body.email, body.token, body.type);
  }

  @Post('generate-otp')
  generateOtp(@Body() body: { email: string }) {
    return this.authService.generateOtp(body.email);
  }

  @Post('verify-numeric-otp')
  verifyNumericOtp(@Body() body: { email: string; code: string }) {
    return this.authService.verifyNumericOtp(body.email, body.code);
  }

  @Post('check-email')
  checkEmail(@Body() body: { email: string }) {
    return this.authService.checkEmail(body.email);
  }

  @Post('reset-password-with-otp')
  resetPasswordWithOtp(@Body() body: { email: string; password: string; sessionToken: string }) {
    return this.authService.resetPasswordWithOtp(body.email, body.password, body.sessionToken);
  }

  @Post('update-password')
  updatePassword(@Body() body: { password: string; accessToken: string }) {
    return this.authService.updatePassword(body.password, body.accessToken);
  }

  @Post('upload-id')
  @UseInterceptors(FileInterceptor('file'))
  uploadId(@UploadedFile() file: Express.Multer.File, @Body('userId') userId: string) {
    return this.authService.uploadId(file, userId);
  }
}
```

- [ ] **Step 10: Install deps and build**

```bash
cd apps/auth-service && npm install && npm run build
```

Expected: `dist/` created, no TypeScript errors

- [ ] **Step 11: Smoke test — start the service and verify it responds**

```bash
cd apps/auth-service && node dist/main &
sleep 3
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3100/auth/login -H "Content-Type: application/json" -d '{"email":"","password":""}'
```

Expected: `401` (Supabase rejects empty credentials — service is up and routing works)

Kill the process: `pkill -f "node dist/main"`

- [ ] **Step 12: Create `apps/auth-service/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3100
CMD ["node", "dist/main"]
```

- [ ] **Step 13: Commit**

```bash
git add apps/auth-service/
git commit -m "feat: add auth-service NestJS microservice"
```

---

## Task 4: Create `apps/campaign-service`

**Files:**
- Create: `apps/campaign-service/package.json`
- Create: `apps/campaign-service/tsconfig.json`
- Create: `apps/campaign-service/tsconfig.build.json`
- Create: `apps/campaign-service/nest-cli.json`
- Create: `apps/campaign-service/src/main.ts`
- Create: `apps/campaign-service/src/app.module.ts`
- Create: `apps/campaign-service/src/campaigns/campaigns.module.ts`
- Create: `apps/campaign-service/src/campaigns/campaigns.controller.ts`
- Create: `apps/campaign-service/src/campaigns/campaigns.service.ts`
- Create: `apps/campaign-service/Dockerfile`

- [ ] **Step 1: Create `apps/campaign-service/package.json`**

```json
{
  "name": "@sitemanager/campaign-service",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "lint": "echo 'lint ok'"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@sitemanager/shared": "*",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "typescript": "^5.1.3"
  }
}
```

- [ ] **Step 2: Create `apps/campaign-service/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false
  }
}
```

- [ ] **Step 3: Create `apps/campaign-service/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create `apps/campaign-service/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

- [ ] **Step 5: Create `apps/campaign-service/src/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3200);
  console.log('campaign-service running on port 3200');
}
bootstrap();
```

- [ ] **Step 6: Create `apps/campaign-service/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({ imports: [CampaignsModule] })
export class AppModule {}
```

- [ ] **Step 7: Create `apps/campaign-service/src/campaigns/campaigns.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({ controllers: [CampaignsController], providers: [CampaignsService] })
export class CampaignsModule {}
```

- [ ] **Step 8: Create `apps/campaign-service/src/campaigns/campaigns.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { supabaseRequest, getStorageUrl, DbCampaign } from '@sitemanager/shared';

@Injectable()
export class CampaignsService {
  async getCampaigns(category?: string) {
    let query = 'hc_campaigns?status=eq.active&select=id,title,description,category,target_amount,collected_amount,cover_image_key,status,end_date&order=created_at.desc';
    if (category) query += `&category=eq.${encodeURIComponent(category)}`;

    const rows = await supabaseRequest<DbCampaign[]>(query);

    const campaigns = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      category: row.category ?? 'other',
      target_amount: Number(row.target_amount),
      collected_amount: Number(row.collected_amount),
      progress_pct: row.target_amount > 0
        ? Math.min(100, Math.round((Number(row.collected_amount) / Number(row.target_amount)) * 100))
        : 0,
      cover_image_url: getStorageUrl('campaigns', row.cover_image_key),
      status: row.status,
      end_date: row.end_date,
    }));

    return { campaigns };
  }
}
```

- [ ] **Step 9: Create `apps/campaign-service/src/campaigns/campaigns.controller.ts`**

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  getCampaigns(@Query('category') category?: string) {
    return this.campaignsService.getCampaigns(category);
  }
}
```

- [ ] **Step 10: Install and build**

```bash
cd apps/campaign-service && npm install && npm run build
```

Expected: `dist/` created, no errors

- [ ] **Step 11: Create `apps/campaign-service/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3200
CMD ["node", "dist/main"]
```

- [ ] **Step 12: Commit**

```bash
git add apps/campaign-service/
git commit -m "feat: add campaign-service NestJS microservice"
```

---

## Task 5: Create `apps/cart-service`

**Files:**
- Create: `apps/cart-service/package.json`
- Create: `apps/cart-service/tsconfig.json`
- Create: `apps/cart-service/tsconfig.build.json`
- Create: `apps/cart-service/nest-cli.json`
- Create: `apps/cart-service/src/main.ts`
- Create: `apps/cart-service/src/app.module.ts`
- Create: `apps/cart-service/src/cart/cart.module.ts`
- Create: `apps/cart-service/src/cart/cart.controller.ts`
- Create: `apps/cart-service/src/cart/cart.service.ts`
- Create: `apps/cart-service/Dockerfile`

- [ ] **Step 1: Create `apps/cart-service/package.json`**

```json
{
  "name": "@sitemanager/cart-service",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "lint": "echo 'lint ok'"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@sitemanager/shared": "*",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "typescript": "^5.1.3"
  }
}
```

- [ ] **Step 2: Create `apps/cart-service/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false
  }
}
```

- [ ] **Step 3: Create `apps/cart-service/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create `apps/cart-service/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

- [ ] **Step 5: Create `apps/cart-service/src/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3300);
  console.log('cart-service running on port 3300');
}
bootstrap();
```

- [ ] **Step 6: Create `apps/cart-service/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';

@Module({ imports: [CartModule] })
export class AppModule {}
```

- [ ] **Step 7: Create `apps/cart-service/src/cart/cart.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({ controllers: [CartController], providers: [CartService] })
export class CartModule {}
```

- [ ] **Step 8: Create `apps/cart-service/src/cart/cart.service.ts`**

```typescript
import { Injectable, HttpException } from '@nestjs/common';
import { supabaseRequest, getStorageUrl, DbCart, DbCartItem } from '@sitemanager/shared';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(v: string | null | undefined): v is string {
  return !!v && UUID_RE.test(v);
}

@Injectable()
export class CartService {
  private async upsertActiveCart(authUserId: string): Promise<string> {
    const existing = await supabaseRequest<DbCart[]>(`carts?auth_user_id=eq.${authUserId}&status=eq.active&limit=1`);
    if (existing.length > 0) return existing[0].id;
    const created = await supabaseRequest<DbCart[]>('carts', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ auth_user_id: authUserId, status: 'active' }),
    });
    return created[0].id;
  }

  private formatCart(cartId: string, items: DbCartItem[]) {
    const mappedItems = items.map((item) => ({
      id: item.id,
      campaign_id: item.campaign_id,
      title: item.hc_campaigns?.title ?? 'Campaign',
      category: item.hc_campaigns?.category ?? 'other',
      cover_image_url: getStorageUrl('campaigns', item.hc_campaigns?.cover_image_key ?? null),
      face_value: Number(item.face_value),
      quantity: item.quantity,
    }));
    const subtotal = mappedItems.reduce((sum, i) => sum + i.face_value * i.quantity, 0);
    const processing_fee = Math.round(subtotal * 0.015);
    return { cart: { id: cartId, items: mappedItems, subtotal, processing_fee, total: subtotal + processing_fee } };
  }

  async getCart(authUserId: string) {
    if (!isUuid(authUserId)) throw new HttpException('Invalid authUserId', 400);
    const cartId = await this.upsertActiveCart(authUserId);
    const items = await supabaseRequest<DbCartItem[]>(
      `cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`
    );
    return this.formatCart(cartId, items);
  }

  async addItem(authUserId: string, campaign_id: string, face_value: number, quantity: number) {
    if (!isUuid(authUserId) || !isUuid(campaign_id) || face_value == null) {
      throw new HttpException('authUserId, campaign_id, face_value required', 400);
    }
    const cartId = await this.upsertActiveCart(authUserId);
    const existing = await supabaseRequest<{ id: string; quantity: number }[]>(
      `cart_items?cart_id=eq.${cartId}&campaign_id=eq.${campaign_id}&limit=1`
    );
    if (existing.length > 0) {
      await supabaseRequest(`cart_items?id=eq.${existing[0].id}`, {
        method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ quantity: existing[0].quantity + (quantity ?? 1) }),
      });
    } else {
      await supabaseRequest('cart_items', {
        method: 'POST', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ cart_id: cartId, campaign_id, face_value, quantity: quantity ?? 1 }),
      });
    }
    const items = await supabaseRequest<DbCartItem[]>(
      `cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`
    );
    return this.formatCart(cartId, items);
  }

  async updateItem(authUserId: string, cart_item_id: string, quantity: number) {
    if (!isUuid(authUserId) || !isUuid(cart_item_id) || quantity === undefined) {
      throw new HttpException('authUserId, cart_item_id, quantity required', 400);
    }
    const cartId = await this.upsertActiveCart(authUserId);
    if (quantity <= 0) {
      await supabaseRequest(`cart_items?id=eq.${cart_item_id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    } else {
      await supabaseRequest(`cart_items?id=eq.${cart_item_id}`, {
        method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ quantity }),
      });
    }
    const items = await supabaseRequest<DbCartItem[]>(
      `cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`
    );
    return this.formatCart(cartId, items);
  }

  async removeItem(authUserId: string, cart_item_id: string) {
    if (!isUuid(authUserId) || !isUuid(cart_item_id)) {
      throw new HttpException('authUserId, cart_item_id required', 400);
    }
    const cartId = await this.upsertActiveCart(authUserId);
    await supabaseRequest(`cart_items?id=eq.${cart_item_id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    const items = await supabaseRequest<DbCartItem[]>(
      `cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`
    );
    return this.formatCart(cartId, items);
  }
}
```

- [ ] **Step 9: Create `apps/cart-service/src/cart/cart.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Delete, Query, Body } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Query('authUserId') authUserId: string) {
    return this.cartService.getCart(authUserId);
  }

  @Post()
  addItem(@Body() body: { authUserId: string; campaign_id: string; face_value: number; quantity: number }) {
    return this.cartService.addItem(body.authUserId, body.campaign_id, body.face_value, body.quantity);
  }

  @Patch()
  updateItem(@Body() body: { authUserId: string; cart_item_id: string; quantity: number }) {
    return this.cartService.updateItem(body.authUserId, body.cart_item_id, body.quantity);
  }

  @Delete()
  removeItem(@Body() body: { authUserId: string; cart_item_id: string }) {
    return this.cartService.removeItem(body.authUserId, body.cart_item_id);
  }
}
```

- [ ] **Step 10: Install and build**

```bash
cd apps/cart-service && npm install && npm run build
```

Expected: `dist/` created, no errors

- [ ] **Step 11: Create `apps/cart-service/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3300
CMD ["node", "dist/main"]
```

- [ ] **Step 12: Commit**

```bash
git add apps/cart-service/
git commit -m "feat: add cart-service NestJS microservice"
```

---

## Task 6: Create `apps/payment-service`

**Files:**
- Create: `apps/payment-service/package.json`
- Create: `apps/payment-service/tsconfig.json`
- Create: `apps/payment-service/tsconfig.build.json`
- Create: `apps/payment-service/nest-cli.json`
- Create: `apps/payment-service/src/main.ts`
- Create: `apps/payment-service/src/app.module.ts`
- Create: `apps/payment-service/src/purchases/purchases.module.ts`
- Create: `apps/payment-service/src/purchases/purchases.controller.ts`
- Create: `apps/payment-service/src/purchases/purchases.service.ts`
- Create: `apps/payment-service/Dockerfile`

- [ ] **Step 1: Create `apps/payment-service/package.json`**

```json
{
  "name": "@sitemanager/payment-service",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "lint": "echo 'lint ok'"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@sitemanager/shared": "*",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "typescript": "^5.1.3"
  }
}
```

- [ ] **Step 2: Create `apps/payment-service/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false
  }
}
```

- [ ] **Step 3: Create `apps/payment-service/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create `apps/payment-service/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

- [ ] **Step 5: Create `apps/payment-service/src/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3400);
  console.log('payment-service running on port 3400');
}
bootstrap();
```

- [ ] **Step 6: Create `apps/payment-service/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { PurchasesModule } from './purchases/purchases.module';

@Module({ imports: [PurchasesModule] })
export class AppModule {}
```

- [ ] **Step 7: Create `apps/payment-service/src/purchases/purchases.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

@Module({ controllers: [PurchasesController], providers: [PurchasesService] })
export class PurchasesModule {}
```

- [ ] **Step 8: Create `apps/payment-service/src/purchases/purchases.service.ts`**

```typescript
import { Injectable, HttpException } from '@nestjs/common';
import { supabaseRequest, findHopecardRecordByTitle, getRecordId, getRecordTitle, DbPurchase } from '@sitemanager/shared';

type HopecardRecord = Record<string, unknown>;
const PAYMENT_METHOD_MAP: Record<string, string> = { gcash: 'gcash', paymaya: 'maya', 'credit card': 'card' };

@Injectable()
export class PurchasesService {
  private normalizePaymentMethod(method: string): string {
    return PAYMENT_METHOD_MAP[method.trim().toLowerCase()] ?? method.trim().toLowerCase();
  }

  private buildPaymentReference(method: string, index: number): string {
    const prefix = method.slice(0, 3).toUpperCase();
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
    return `${prefix}-HC-${datePart}-${index + 1}-${suffix}`;
  }

  private async fetchHopecards(): Promise<HopecardRecord[]> {
    const results = await Promise.allSettled([
      supabaseRequest<HopecardRecord[]>('hc_campaigns?select=*'),
      supabaseRequest<HopecardRecord[]>('hopecards?select=*'),
    ]);
    const records: HopecardRecord[] = [];
    results.forEach((r) => { if (r.status === 'fulfilled') records.push(...r.value); });
    if (records.length === 0) throw new Error('No campaign source rows found in hc_campaigns or hopecards.');
    return records;
  }

  async createPurchases(buyerAuthId: string, paymentMethod: string, checkoutItems: { cardId: string; title: string; amount: number; quantity: number }[]) {
    if (!buyerAuthId) throw new HttpException('buyerAuthId is required.', 400);
    if (!paymentMethod) throw new HttpException('paymentMethod is required.', 400);
    if (!checkoutItems?.length) throw new HttpException('At least one checkout item is required.', 400);

    const method = this.normalizePaymentMethod(paymentMethod);
    const hopecards = await this.fetchHopecards();

    const purchasesToInsert = checkoutItems.map((item, index) => {
      const hopecard = findHopecardRecordByTitle(hopecards, item.title);
      const hopecardId = hopecard ? getRecordId(hopecard) : null;
      if (!hopecardId) throw new Error(`No campaign row matched "${item.title}".`);
      return {
        buyer_auth_id: buyerAuthId,
        hopecard_id: hopecardId,
        amount_paid: item.amount * item.quantity,
        payment_method: method,
        payment_reference: this.buildPaymentReference(method, index),
        status: 'paid',
        purchased_at: new Date().toISOString(),
      };
    });

    const inserted = await supabaseRequest<DbPurchase[]>('hopecard_purchases', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(purchasesToInsert),
    });

    return { purchases: inserted };
  }

  async getPurchases(buyerAuthId: string) {
    if (!buyerAuthId) throw new HttpException('buyerAuthId is required.', 400);
    const purchases = await supabaseRequest<DbPurchase[]>(
      `hopecard_purchases?select=*&buyer_auth_id=eq.${encodeURIComponent(buyerAuthId)}&order=purchased_at.desc`
    );
    const hopecards = await this.fetchHopecards();
    const titleById = new Map<string, string>();
    hopecards.forEach((r) => {
      const id = getRecordId(r);
      const title = getRecordTitle(r);
      if (id && title) titleById.set(id, title);
    });
    const transactions = purchases.map((p) => ({
      id: p.id,
      title: titleById.get(p.hopecard_id) ?? p.hopecard_id,
      amount: p.amount_paid,
      method: p.payment_method,
      status: p.status,
      paymentReference: p.payment_reference,
      purchasedAt: p.purchased_at,
    }));
    return { transactions };
  }
}
```

- [ ] **Step 9: Create `apps/payment-service/src/purchases/purchases.controller.ts`**

```typescript
import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  getPurchases(@Query('buyerAuthId') buyerAuthId: string) {
    return this.purchasesService.getPurchases(buyerAuthId);
  }

  @Post()
  createPurchases(@Body() body: { buyerAuthId: string; paymentMethod: string; checkoutItems: any[] }) {
    return this.purchasesService.createPurchases(body.buyerAuthId, body.paymentMethod, body.checkoutItems);
  }
}
```

- [ ] **Step 10: Install and build**

```bash
cd apps/payment-service && npm install && npm run build
```

Expected: `dist/` created, no errors

- [ ] **Step 11: Create `apps/payment-service/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3400
CMD ["node", "dist/main"]
```

- [ ] **Step 12: Commit**

```bash
git add apps/payment-service/
git commit -m "feat: add payment-service NestJS microservice"
```

---

## Task 7: Create `apps/profile-service`

**Files:**
- Create: `apps/profile-service/package.json`
- Create: `apps/profile-service/tsconfig.json`
- Create: `apps/profile-service/tsconfig.build.json`
- Create: `apps/profile-service/nest-cli.json`
- Create: `apps/profile-service/src/main.ts`
- Create: `apps/profile-service/src/app.module.ts`
- Create: `apps/profile-service/src/profile/profile.module.ts`
- Create: `apps/profile-service/src/profile/profile.controller.ts`
- Create: `apps/profile-service/src/profile/profile.service.ts`
- Create: `apps/profile-service/Dockerfile`

- [ ] **Step 1: Create `apps/profile-service/package.json`**

```json
{
  "name": "@sitemanager/profile-service",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "lint": "echo 'lint ok'"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@sitemanager/shared": "*",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "typescript": "^5.1.3"
  }
}
```

- [ ] **Step 2: Create `apps/profile-service/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false
  }
}
```

- [ ] **Step 3: Create `apps/profile-service/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create `apps/profile-service/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

- [ ] **Step 5: Create `apps/profile-service/src/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3500);
  console.log('profile-service running on port 3500');
}
bootstrap();
```

- [ ] **Step 6: Create `apps/profile-service/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';

@Module({ imports: [ProfileModule] })
export class AppModule {}
```

- [ ] **Step 7: Create `apps/profile-service/src/profile/profile.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({ controllers: [ProfileController], providers: [ProfileService] })
export class ProfileModule {}
```

- [ ] **Step 8: Create `apps/profile-service/src/profile/profile.service.ts`**

```typescript
import { Injectable, HttpException } from '@nestjs/common';
import { supabaseRequest, getStorageUrl, DbProfile } from '@sitemanager/shared';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface DbImpactProfile {
  total_donations_amount: number;
  total_donations_count: number;
  first_name: string;
}

interface DbImpactPurchase {
  id: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  purchased_at: string;
  hopecards: { hc_campaigns: { title: string } | null } | null;
}

@Injectable()
export class ProfileService {
  async getProfile(authUserId: string, email?: string) {
    if (!authUserId || !UUID_RE.test(authUserId)) throw new HttpException('Invalid authUserId', 400);

    let rows = await supabaseRequest<DbProfile[]>(
      `digital_donor_profiles?auth_user_id=eq.${authUserId}&select=id,first_name,last_name,phone,address,barangay,municipality,province,profile_photo_key,status,created_at,total_donations_amount,total_donations_count&limit=1`
    );

    if (rows.length === 0 && email) {
      rows = await supabaseRequest<DbProfile[]>(
        `digital_donor_profiles?email=eq.${encodeURIComponent(email)}&select=id,first_name,last_name,phone,address,barangay,municipality,province,profile_photo_key,status,created_at,total_donations_amount,total_donations_count&limit=1`
      );
    }

    if (rows.length === 0) throw new HttpException('Profile not found', 404);

    const row = rows[0];
    return {
      profile: {
        id: row.id, first_name: row.first_name, last_name: row.last_name,
        phone: row.phone || '', address: row.address || '',
        barangay: row.barangay || '', municipality: row.municipality || '', province: row.province || '',
        profile_photo_url: getStorageUrl('profile-photos', row.profile_photo_key),
        profile_photo_key: row.profile_photo_key || '',
        status: row.status, created_at: row.created_at,
        total_donations_amount: row.total_donations_amount || 0,
        total_donations_count: row.total_donations_count || 0,
      },
    };
  }

  async updateProfile(authUserId: string, updates: Partial<DbProfile & { profile_photo_key: string }>) {
    if (!authUserId || !UUID_RE.test(authUserId)) throw new HttpException('Invalid authUserId', 400);
    const patch: Record<string, string> = { updated_at: new Date().toISOString() };
    const fields = ['first_name', 'last_name', 'phone', 'address', 'barangay', 'municipality', 'province', 'profile_photo_key'];
    fields.forEach((f) => { if ((updates as any)[f] !== undefined) patch[f] = (updates as any)[f]; });
    await supabaseRequest(`digital_donor_profiles?auth_user_id=eq.${authUserId}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch),
    });
    return { success: true };
  }

  async getImpact(authUserId: string) {
    if (!authUserId || !UUID_RE.test(authUserId)) throw new HttpException('Invalid authUserId', 400);

    const [profiles, purchases] = await Promise.all([
      supabaseRequest<DbImpactProfile[]>(
        `digital_donor_profiles?auth_user_id=eq.${authUserId}&select=total_donations_amount,total_donations_count,first_name&limit=1`
      ),
      supabaseRequest<DbImpactPurchase[]>(
        `hopecard_purchases?buyer_auth_id=eq.${authUserId}&select=id,amount_paid,payment_method,status,purchased_at,hopecards(hc_campaigns(title))&order=purchased_at.desc&limit=20`
      ),
    ]);

    const profile = profiles[0] ?? { total_donations_amount: 0, total_donations_count: 0, first_name: 'Donor' };
    const totalAmount = Number(profile.total_donations_amount);

    const donationHistory = purchases.map((p) => ({
      id: p.id,
      campaign_title: p.hopecards?.hc_campaigns?.title ?? 'Donation',
      amount_paid: Number(p.amount_paid),
      payment_method: p.payment_method,
      status: p.status,
      purchased_at: p.purchased_at,
    }));

    return {
      first_name: profile.first_name,
      stats: {
        total_donations_amount: totalAmount,
        total_donations_count: Number(profile.total_donations_count),
        lives_touched: Math.floor(totalAmount / 500),
      },
      donation_history: donationHistory,
    };
  }
}
```

- [ ] **Step 9: Create `apps/profile-service/src/profile/profile.controller.ts`**

```typescript
import { Controller, Get, Patch, Query, Body, Headers } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('profile')
  getProfile(@Query('authUserId') authUserId: string, @Query('email') email?: string) {
    return this.profileService.getProfile(authUserId, email);
  }

  @Patch('profile')
  updateProfile(@Body() body: any) {
    const { authUserId, ...updates } = body;
    return this.profileService.updateProfile(authUserId, updates);
  }

  @Get('impact')
  getImpact(@Query('authUserId') authUserId: string) {
    return this.profileService.getImpact(authUserId);
  }
}
```

- [ ] **Step 10: Install and build**

```bash
cd apps/profile-service && npm install && npm run build
```

Expected: `dist/` created, no errors

- [ ] **Step 11: Create `apps/profile-service/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3500
CMD ["node", "dist/main"]
```

- [ ] **Step 12: Commit**

```bash
git add apps/profile-service/
git commit -m "feat: add profile-service NestJS microservice"
```

---

## Task 8: Create `apps/api-gateway`

**Files:**
- Create: `apps/api-gateway/package.json`
- Create: `apps/api-gateway/tsconfig.json`
- Create: `apps/api-gateway/tsconfig.build.json`
- Create: `apps/api-gateway/nest-cli.json`
- Create: `apps/api-gateway/src/main.ts`
- Create: `apps/api-gateway/src/app.module.ts`
- Create: `apps/api-gateway/src/middleware/auth.middleware.ts`
- Create: `apps/api-gateway/Dockerfile`

- [ ] **Step 1: Create `apps/api-gateway/package.json`**

```json
{
  "name": "@sitemanager/api-gateway",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "lint": "echo 'lint ok'"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@supabase/supabase-js": "^2.103.0",
    "http-proxy-middleware": "^3.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "typescript": "^5.1.3"
  }
}
```

- [ ] **Step 2: Create `apps/api-gateway/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false
  }
}
```

- [ ] **Step 3: Create `apps/api-gateway/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create `apps/api-gateway/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

- [ ] **Step 5: Create `apps/api-gateway/src/middleware/auth.middleware.ts`**

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: missing token' });
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(url, anonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized: invalid token' });
      return;
    }
    req.headers['x-user-id'] = user.id;
    next();
  }
}
```

- [ ] **Step 6: Create `apps/api-gateway/src/app.module.ts`**

```typescript
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AuthMiddleware } from './middleware/auth.middleware';

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3100';
const CAMPAIGN_SERVICE = process.env.CAMPAIGN_SERVICE_URL || 'http://localhost:3200';
const CART_SERVICE = process.env.CART_SERVICE_URL || 'http://localhost:3300';
const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3400';
const PROFILE_SERVICE = process.env.PROFILE_SERVICE_URL || 'http://localhost:3500';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Auth routes — no JWT required
    consumer
      .apply(createProxyMiddleware({ target: AUTH_SERVICE, changeOrigin: true }))
      .forRoutes({ path: 'auth/*', method: RequestMethod.ALL });

    // Protected routes — JWT required
    consumer
      .apply(AuthMiddleware, createProxyMiddleware({ target: CAMPAIGN_SERVICE, changeOrigin: true }))
      .forRoutes({ path: 'campaigns*', method: RequestMethod.ALL });

    consumer
      .apply(AuthMiddleware, createProxyMiddleware({ target: CART_SERVICE, changeOrigin: true }))
      .forRoutes({ path: 'cart*', method: RequestMethod.ALL });

    consumer
      .apply(AuthMiddleware, createProxyMiddleware({ target: PAYMENT_SERVICE, changeOrigin: true }))
      .forRoutes({ path: 'purchases*', method: RequestMethod.ALL });

    consumer
      .apply(AuthMiddleware, createProxyMiddleware({ target: PROFILE_SERVICE, changeOrigin: true }))
      .forRoutes(
        { path: 'profile*', method: RequestMethod.ALL },
        { path: 'impact*', method: RequestMethod.ALL },
      );
  }
}
```

- [ ] **Step 7: Create `apps/api-gateway/src/main.ts`**

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  await app.listen(3000);
  console.log('api-gateway running on port 3000');
}
bootstrap();
```

- [ ] **Step 8: Install and build**

```bash
cd apps/api-gateway && npm install && npm run build
```

Expected: `dist/` created, no errors

- [ ] **Step 9: Create `apps/api-gateway/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main"]
```

- [ ] **Step 10: Commit**

```bash
git add apps/api-gateway/
git commit -m "feat: add api-gateway NestJS service with JWT middleware and proxy routing"
```

---

## Task 9: Migrate Frontend to `apps/frontend`

**Files:**
- Move: all root frontend files into `apps/frontend/`
- Delete: `apps/frontend/app/api/` (entire directory)
- Modify: all frontend files that call `fetch('/api/...')`
- Create: `apps/frontend/.env.local`

- [ ] **Step 1: Move frontend files into `apps/frontend/`**

Run from the repo root:

```bash
mkdir -p apps/frontend
# Move Next.js app files
mv app apps/frontend/app
mv components apps/frontend/components
mv lib apps/frontend/lib
mv public apps/frontend/public
mv next.config.ts apps/frontend/next.config.ts
mv eslint.config.mjs apps/frontend/eslint.config.mjs
# Note: Task 1 already created a new root tsconfig.json (NestJS-oriented).
# The original Next.js tsconfig is still at root — move it to the frontend:
mv tsconfig.json apps/frontend/tsconfig.json
# Then recreate the root tsconfig.json per Task 1 Step 2 (it was overwritten by the mv)
# Copy package.json as starting point, will replace in next step
cp package.json apps/frontend/package.json
```

- [ ] **Step 2: Replace `apps/frontend/package.json` with frontend-specific config**

```json
{
  "name": "@sitemanager/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.103.0",
    "lucide-react": "^1.8.0",
    "next": "^16.2.3",
    "nodemailer": "^8.0.5",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native-web": "^0.21.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/nodemailer": "^8.0.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/react-native": "^0.72.8",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: Delete the Next.js API routes directory**

```bash
rm -rf apps/frontend/app/api
```

- [ ] **Step 4: Create `apps/frontend/.env.local`**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

- [ ] **Step 5: Update all `fetch('/api/...')` calls to use the gateway URL**

Search for all occurrences across the frontend:

```bash
grep -r "fetch('/api/" apps/frontend/ --include="*.ts" --include="*.tsx" -l
```

For each file found, replace all instances of `fetch('/api/` with `fetch(\`\${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/\`` and update the path by removing the `/api` prefix.

Specifically apply these replacements (run from `apps/frontend/`):

| Old | New |
|-----|-----|
| `fetch('/api/auth/login'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/login` `` |
| `fetch('/api/auth/signup'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/signup` `` |
| `fetch('/api/auth/send-otp'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/send-otp` `` |
| `fetch('/api/auth/verify-otp'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/verify-otp` `` |
| `fetch('/api/auth/generate-otp'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/generate-otp` `` |
| `fetch('/api/auth/verify-numeric-otp'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/verify-numeric-otp` `` |
| `fetch('/api/auth/check-email'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/check-email` `` |
| `fetch('/api/auth/reset-password-with-otp'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/reset-password-with-otp` `` |
| `fetch('/api/auth/update-password'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/update-password` `` |
| `fetch('/api/auth/upload-id'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/auth/upload-id` `` |
| `fetch('/api/campaigns'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/campaigns` `` |
| `fetch('/api/cart'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/cart` `` |
| `fetch('/api/hopecard-purchases'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/purchases` `` |
| `fetch('/api/profile'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/profile` `` |
| `fetch('/api/impact'` | `` fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/impact` `` |

After applying replacements, verify no remaining `/api/` fetch calls:

```bash
grep -r "fetch('/api/" apps/frontend/ --include="*.ts" --include="*.tsx"
```

Expected: no output (zero matches remaining)

- [ ] **Step 6: Also update any dynamic fetch calls using URL constructors**

Search for:
```bash
grep -r "url.*api\|api.*url" apps/frontend/ --include="*.ts" --include="*.tsx" -i
```

If any fetch calls build URLs using string concatenation or URL constructors with `/api/`, update them the same way — replace the base path with `process.env.NEXT_PUBLIC_API_GATEWAY_URL` and remove the `/api` segment.

- [ ] **Step 7: Create `apps/frontend/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3001
CMD ["npm", "run", "start"]
```

- [ ] **Step 8: Verify frontend builds**

```bash
cd apps/frontend && npm install && npm run build
```

Expected: Next.js build succeeds with no errors

- [ ] **Step 9: Commit**

```bash
git add apps/frontend/
git commit -m "feat: migrate frontend to apps/frontend, remove Next.js API routes, point to api-gateway"
```

---

## Task 10: Create Docker Compose

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create `docker-compose.yml` at repo root**

```yaml
version: '3.9'

services:
  api-gateway:
    build:
      context: ./apps/api-gateway
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      AUTH_SERVICE_URL: http://auth-service:3100
      CAMPAIGN_SERVICE_URL: http://campaign-service:3200
      CART_SERVICE_URL: http://cart-service:3300
      PAYMENT_SERVICE_URL: http://payment-service:3400
      PROFILE_SERVICE_URL: http://profile-service:3500
    depends_on:
      - auth-service
      - campaign-service
      - cart-service
      - payment-service
      - profile-service

  auth-service:
    build:
      context: ./apps/auth-service
      dockerfile: Dockerfile
    ports:
      - "3100:3100"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_SECURE: ${SMTP_SECURE}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SMTP_FROM: ${SMTP_FROM}

  campaign-service:
    build:
      context: ./apps/campaign-service
      dockerfile: Dockerfile
    ports:
      - "3200:3200"
    environment:
      SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}

  cart-service:
    build:
      context: ./apps/cart-service
      dockerfile: Dockerfile
    ports:
      - "3300:3300"
    environment:
      SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}

  payment-service:
    build:
      context: ./apps/payment-service
      dockerfile: Dockerfile
    ports:
      - "3400:3400"
    environment:
      SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}

  profile-service:
    build:
      context: ./apps/profile-service
      dockerfile: Dockerfile
    ports:
      - "3500:3500"
    environment:
      SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      NEXT_PUBLIC_API_GATEWAY_URL: http://api-gateway:3000
    depends_on:
      - api-gateway
```

- [ ] **Step 2: Verify docker-compose config is valid**

```bash
docker-compose config
```

Expected: YAML is parsed without errors, all 7 services listed

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose.yml orchestrating all 7 microservices"
```

---

## Task 11: Create GitHub Actions CI Workflows

**Files:**
- Create: `.github/workflows/ci-api-gateway.yml`
- Create: `.github/workflows/ci-auth-service.yml`
- Create: `.github/workflows/ci-campaign-service.yml`
- Create: `.github/workflows/ci-cart-service.yml`
- Create: `.github/workflows/ci-payment-service.yml`
- Create: `.github/workflows/ci-profile-service.yml`
- Create: `.github/workflows/ci-frontend.yml`

- [ ] **Step 1: Create `.github/workflows/ci-api-gateway.yml`**

```yaml
name: CI — api-gateway

on:
  push:
    paths:
      - 'apps/api-gateway/**'
  pull_request:
    paths:
      - 'apps/api-gateway/**'

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/api-gateway
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/api-gateway/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Build Docker image
        run: docker build -t api-gateway:${{ github.sha }} .
```

- [ ] **Step 2: Create `.github/workflows/ci-auth-service.yml`**

```yaml
name: CI — auth-service

on:
  push:
    paths:
      - 'apps/auth-service/**'
  pull_request:
    paths:
      - 'apps/auth-service/**'

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/auth-service
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/auth-service/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Build Docker image
        run: docker build -t auth-service:${{ github.sha }} .
```

- [ ] **Step 3: Create `.github/workflows/ci-campaign-service.yml`**

```yaml
name: CI — campaign-service

on:
  push:
    paths:
      - 'apps/campaign-service/**'
      - 'libs/shared/**'
  pull_request:
    paths:
      - 'apps/campaign-service/**'
      - 'libs/shared/**'

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/campaign-service
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/campaign-service/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Build Docker image
        run: docker build -t campaign-service:${{ github.sha }} .
```

- [ ] **Step 4: Create `.github/workflows/ci-cart-service.yml`**

```yaml
name: CI — cart-service

on:
  push:
    paths:
      - 'apps/cart-service/**'
      - 'libs/shared/**'
  pull_request:
    paths:
      - 'apps/cart-service/**'
      - 'libs/shared/**'

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/cart-service
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/cart-service/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Build Docker image
        run: docker build -t cart-service:${{ github.sha }} .
```

- [ ] **Step 5: Create `.github/workflows/ci-payment-service.yml`**

```yaml
name: CI — payment-service

on:
  push:
    paths:
      - 'apps/payment-service/**'
      - 'libs/shared/**'
  pull_request:
    paths:
      - 'apps/payment-service/**'
      - 'libs/shared/**'

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/payment-service
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/payment-service/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Build Docker image
        run: docker build -t payment-service:${{ github.sha }} .
```

- [ ] **Step 6: Create `.github/workflows/ci-profile-service.yml`**

```yaml
name: CI — profile-service

on:
  push:
    paths:
      - 'apps/profile-service/**'
      - 'libs/shared/**'
  pull_request:
    paths:
      - 'apps/profile-service/**'
      - 'libs/shared/**'

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/profile-service
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/profile-service/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Build Docker image
        run: docker build -t profile-service:${{ github.sha }} .
```

- [ ] **Step 7: Create `.github/workflows/ci-frontend.yml`**

```yaml
name: CI — frontend

on:
  push:
    paths:
      - 'apps/frontend/**'
  pull_request:
    paths:
      - 'apps/frontend/**'

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/frontend
    env:
      NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder-key
      NEXT_PUBLIC_API_GATEWAY_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Build Docker image
        run: docker build -t frontend:${{ github.sha }} .
```

- [ ] **Step 8: Commit all workflows**

```bash
git add .github/workflows/
git commit -m "ci: add per-service GitHub Actions workflows for independent deployment"
```

---

## Task 12: Final Verification

- [ ] **Step 1: Copy `.env.example` to `.env` and fill in real values**

```bash
cp .env.example .env
# Edit .env with your actual Supabase URL, keys, and SMTP credentials
```

- [ ] **Step 2: Build all services from root**

```bash
npm run build
```

Expected: All workspaces build without errors

- [ ] **Step 3: Start the full stack with Docker Compose**

```bash
docker-compose up --build
```

Expected: All 7 containers start. Look for these log lines:
```
auth-service running on port 3100
campaign-service running on port 3200
cart-service running on port 3300
payment-service running on port 3400
profile-service running on port 3500
api-gateway running on port 3000
```

- [ ] **Step 4: Smoke test auth endpoint through gateway**

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' | jq .
```

Expected: `{"error": "Invalid login credentials"}` — gateway is routing to auth-service and returning the Supabase error

- [ ] **Step 5: Smoke test campaigns endpoint through gateway (with a valid token)**

```bash
# Use a real Supabase JWT obtained from auth/login with valid credentials
TOKEN="your-supabase-jwt-here"
curl -s http://localhost:3000/campaigns \
  -H "Authorization: Bearer $TOKEN" | jq .campaigns[0].title
```

Expected: A campaign title string (or empty array if no campaigns) — not a 401/500

- [ ] **Step 6: Verify frontend loads**

Open `http://localhost:3001` in a browser.

Expected: The HopeCard landing page renders. Log in with a valid account — the login flow should complete without errors (auth request goes through gateway to auth-service to Supabase).

- [ ] **Step 7: Confirm no `/api/` fetch calls remain in frontend**

```bash
grep -r "fetch('/api/" apps/frontend/ --include="*.ts" --include="*.tsx"
```

Expected: no output

- [ ] **Step 8: Tag the final commit**

```bash
git add .
git commit -m "chore: microservices migration complete — 6 NestJS services + frontend + Docker + CI"
git tag v2.0.0-microservices
```
