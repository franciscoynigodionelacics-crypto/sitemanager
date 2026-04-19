# Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded data on /home, /explore, /basket, /transactions, and /settings with live Supabase data via dedicated API routes and client hooks.

**Architecture:** One Next.js Route Handler per page concern (`/api/campaigns`, `/api/cart`, `/api/impact`, `/api/profile`), each using the service-role key via the existing `supabaseRequest` helper. Client pages call these routes through custom hooks that manage loading/error state. CartContext is extended to sync reads and writes to the database.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase (PostgreSQL + Storage), `supabaseRequest` from `lib/hopecard-supabase.ts`, `getCurrentUser` from `lib/supabase-client.ts`

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `lib/storage-url.ts` | Build Supabase Storage public URLs from keys |
| Create | `app/api/campaigns/route.ts` | GET active campaigns, filterable by category |
| Create | `app/api/cart/route.ts` | GET / POST / PATCH / DELETE cart items |
| Create | `app/api/impact/route.ts` | GET donation history + impact stats |
| Create | `app/api/profile/route.ts` | GET / PATCH donor profile |
| Create | `hooks/useCampaigns.ts` | Client hook → `/api/campaigns` |
| Create | `hooks/useImpact.ts` | Client hook → `/api/impact` |
| Create | `hooks/useProfile.ts` | Client hook → `/api/profile` |
| Modify | `contexts/CartContext.tsx` | Add DB sync (load on mount, persist mutations) |
| Modify | `app/home/page.tsx` | Replace hardcoded campaigns with `useCampaigns()` |
| Modify | `app/explore/page.tsx` | Replace hardcoded campaigns with `useCampaigns()` |
| Modify | `app/basket/page.tsx` | Replace local state + INITIAL_CART with CartContext |
| Modify | `app/transactions/page.tsx` | Replace hardcoded constants with `useImpact()` |
| Modify | `app/settings/HopecardSettings.tsx` | Add profile info + photo edit via `useProfile()` |

---

## Task 1: DB Migration — add `category` to `hc_campaigns`

**Files:**
- No code files changed — this is a SQL migration run via Supabase MCP

- [ ] **Step 1: Run the migration**

Apply this SQL to the project `hycsbfugiboutvgbvueg`:

```sql
ALTER TABLE hc_campaigns
ADD COLUMN IF NOT EXISTS category TEXT
CHECK (category IN ('health', 'education', 'environment', 'disaster'));
```

- [ ] **Step 2: Verify the column exists**

Run:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'hc_campaigns' AND column_name = 'category';
```

Expected: one row returned with `column_name = 'category'`, `data_type = 'text'`, `is_nullable = YES`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add category column to hc_campaigns"
```

---

## Task 2: Storage URL helper

**Files:**
- Create: `lib/storage-url.ts`

- [ ] **Step 1: Create the helper**

```typescript
// lib/storage-url.ts
export function getStorageUrl(bucket: string, key: string | null | undefined): string | null {
  if (!key) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return `${url}/storage/v1/object/public/${bucket}/${key}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/storage-url.ts
git commit -m "feat: add Supabase Storage URL helper"
```

---

## Task 3: GET /api/campaigns

**Files:**
- Create: `app/api/campaigns/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseRequest } from '../../../lib/hopecard-supabase';
import { getStorageUrl } from '../../../lib/storage-url';

interface DbCampaign {
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query = 'hc_campaigns?status=eq.active&select=id,title,description,category,target_amount,collected_amount,cover_image_key,status,end_date&order=created_at.desc';
    if (category) {
      query += `&category=eq.${encodeURIComponent(category)}`;
    }

    const rows = await supabaseRequest<DbCampaign[]>(query);

    const campaigns = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      category: row.category ?? 'other',
      target_amount: Number(row.target_amount),
      collected_amount: Number(row.collected_amount),
      progress_pct: row.target_amount > 0
        ? Math.round((Number(row.collected_amount) / Number(row.target_amount)) * 100)
        : 0,
      cover_image_url: getStorageUrl('campaigns', row.cover_image_key),
      status: row.status,
      end_date: row.end_date,
    }));

    return NextResponse.json({ campaigns });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch campaigns';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Manually verify**

Start the dev server (`npm run dev`) and visit:
```
http://localhost:3000/api/campaigns
```
Expected: `{ "campaigns": [...] }` — 8 rows (all active), each with `id`, `title`, `category`, `progress_pct`, etc.

Then visit:
```
http://localhost:3000/api/campaigns?category=health
```
Expected: only campaigns with `category = 'health'` (may be 0 until you populate categories).

- [ ] **Step 3: Commit**

```bash
git add app/api/campaigns/route.ts
git commit -m "feat: add GET /api/campaigns route"
```

---

## Task 4: useCampaigns hook

**Files:**
- Create: `hooks/useCampaigns.ts`

- [ ] **Step 1: Create the hook**

```typescript
// hooks/useCampaigns.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  collected_amount: number;
  progress_pct: number;
  cover_image_url: string | null;
  status: string;
  end_date: string | null;
}

export function useCampaigns(category?: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = category
        ? `/api/campaigns?category=${encodeURIComponent(category)}`
        : '/api/campaigns';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load campaigns');
      setCampaigns(data.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useCampaigns.ts
git commit -m "feat: add useCampaigns client hook"
```

---

## Task 5: Update /home page

**Files:**
- Modify: `app/home/page.tsx`

- [ ] **Step 1: Read the current file** (already read — key sections below)

The file has a `CampaignCard` component accepting `imageSrc, imageAlt, category, title, description, raised, progressPct`. The hardcoded `campaigns` array and `FEATURED_CAMPAIGN` object drive the UI.

- [ ] **Step 2: Replace hardcoded data with hook**

At the top of `app/home/page.tsx`, replace the import section and add the hook. Find the line:

```typescript
import React, { useState } from "react";
```

Replace with:
```typescript
import React, { useState, useCallback } from "react";
import { useCampaigns } from "../../hooks/useCampaigns";
```

- [ ] **Step 3: Remove the hardcoded campaigns array**

Find and delete the entire `const campaigns = [...]` block (all hardcoded campaign objects) and the `const FEATURED_CAMPAIGN = {...}` block.

- [ ] **Step 4: Add hook call inside the page component**

Inside the page component function (after `const [activeCategory, setActiveCategory] = useState("All")`), add:

```typescript
const categoryParam = activeCategory === "All" ? undefined : activeCategory.toLowerCase();
const { campaigns, loading, error } = useCampaigns(categoryParam);

const featured = campaigns[0] ?? null;
```

- [ ] **Step 5: Replace hardcoded data references in JSX**

Update all references that previously used the hardcoded `campaigns` array and `FEATURED_CAMPAIGN`:

For the featured campaign section, wrap it in a null check:
```tsx
{featured && (
  // existing featured campaign JSX, replacing FEATURED_CAMPAIGN.xxx with:
  // featured.cover_image_url ?? '/placeholder.jpg'  for imageSrc
  // featured.title                                   for title
  // featured.description                             for description
  // `₱${featured.collected_amount.toLocaleString()}` for raised
  // `₱${featured.target_amount.toLocaleString()}`    for goal
  // featured.progress_pct                            for progressPct
)}
```

For the campaign grid, replace the `campaigns.map(...)` call using the same field mapping:
```tsx
{loading && <p style={{ color: colors.onSurfaceVariant }}>Loading campaigns...</p>}
{error && <p style={{ color: colors.secondary }}>Could not load campaigns.</p>}
{!loading && campaigns.map((c) => (
  <CampaignCard
    key={c.id}
    imageSrc={c.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign'}
    imageAlt={c.title}
    category={c.category}
    title={c.title}
    description={c.description}
    raised={`₱${c.collected_amount.toLocaleString()}`}
    progressPct={c.progress_pct}
  />
))}
```

- [ ] **Step 6: Verify in browser**

Open `http://localhost:3000/home`. Campaigns should load from the API. Category filter pills should refetch.

- [ ] **Step 7: Commit**

```bash
git add app/home/page.tsx
git commit -m "feat: wire /home page to live campaign data"
```

---

## Task 6: Update /explore page

**Files:**
- Modify: `app/explore/page.tsx`

- [ ] **Step 1: Add hook import**

At top of `app/explore/page.tsx`, add:
```typescript
import { useCampaigns } from "../../hooks/useCampaigns";
```

- [ ] **Step 2: Remove ALL_CAMPAIGNS constant**

Delete the entire `const ALL_CAMPAIGNS: Campaign[] = [...]` block.

- [ ] **Step 3: Add hook inside the component**

Inside the `ExplorePage` component, after `const [activeCategory, setActiveCategory] = useState("All")`, add:

```typescript
const categoryParam = activeCategory === "All" ? undefined : activeCategory.toLowerCase();
const { campaigns, loading, error } = useCampaigns(categoryParam);
```

- [ ] **Step 4: Update JSX**

Replace any reference to `ALL_CAMPAIGNS` or the filtered local array with the `campaigns` from the hook. The `Campaign` interface in this file can be removed since `useCampaigns` exports its own. Update campaign card rendering:

```tsx
{loading && <p style={{ color: colors.onSurfaceVariant, gridColumn: "1/-1" }}>Loading campaigns...</p>}
{error && <p style={{ color: colors.secondary, gridColumn: "1/-1" }}>Could not load campaigns.</p>}
{!loading && campaigns.map((c) => (
  // existing card JSX, mapping fields:
  // c.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign'  → imageSrc
  // c.title            → title
  // c.description      → description
  // c.category         → category
  // `₱${c.collected_amount.toLocaleString()}` → raised
  // `₱${c.target_amount.toLocaleString()}`    → goal
  // c.progress_pct     → progressPct
  // c.id               → key and id for modal
))}
```

- [ ] **Step 5: Verify in browser**

Open `http://localhost:3000/explore`. All campaigns load. Category filter changes the list. DonationModal still opens on card click.

- [ ] **Step 6: Commit**

```bash
git add app/explore/page.tsx
git commit -m "feat: wire /explore page to live campaign data"
```

---

## Task 7: Cart API routes

**Files:**
- Create: `app/api/cart/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseRequest } from '../../../lib/hopecard-supabase';
import { getStorageUrl } from '../../../lib/storage-url';

interface DbCart {
  id: string;
  auth_user_id: string;
  status: string;
}

interface DbCartItemRow {
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

async function upsertActiveCart(authUserId: string): Promise<string> {
  // Try to find an existing active cart
  const existing = await supabaseRequest<DbCart[]>(
    `carts?auth_user_id=eq.${authUserId}&status=eq.active&limit=1`
  );
  if (existing.length > 0) return existing[0].id;

  // Create a new cart
  const created = await supabaseRequest<DbCart[]>('carts', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ auth_user_id: authUserId, status: 'active' }),
  });
  return created[0].id;
}

function formatCartResponse(cartId: string, items: DbCartItemRow[]) {
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

  return {
    cart: {
      id: cartId,
      items: mappedItems,
      subtotal,
      processing_fee,
      total: subtotal + processing_fee,
    },
  };
}

// GET — load the user's active cart
export async function GET(req: NextRequest) {
  try {
    const authUserId = req.nextUrl.searchParams.get('authUserId');
    if (!authUserId) return NextResponse.json({ error: 'authUserId required' }, { status: 400 });

    const cartId = await upsertActiveCart(authUserId);

    const items = await supabaseRequest<DbCartItemRow[]>(
      `cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`
    );

    return NextResponse.json(formatCartResponse(cartId, items));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load cart';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — add item to cart
export async function POST(req: NextRequest) {
  try {
    const { authUserId, campaign_id, face_value, quantity } = await req.json();
    if (!authUserId || !campaign_id || !face_value)
      return NextResponse.json({ error: 'authUserId, campaign_id, face_value required' }, { status: 400 });

    const cartId = await upsertActiveCart(authUserId);

    // Check if campaign already in cart
    const existing = await supabaseRequest<{ id: string; quantity: number }[]>(
      `cart_items?cart_id=eq.${cartId}&campaign_id=eq.${campaign_id}&limit=1`
    );

    if (existing.length > 0) {
      // Increment quantity
      await supabaseRequest(`cart_items?id=eq.${existing[0].id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ quantity: existing[0].quantity + (quantity ?? 1) }),
      });
    } else {
      // Insert new item
      await supabaseRequest('cart_items', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ cart_id: cartId, campaign_id, face_value, quantity: quantity ?? 1 }),
      });
    }

    // Return full updated cart
    const items = await supabaseRequest<DbCartItemRow[]>(
      `cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`
    );
    return NextResponse.json(formatCartResponse(cartId, items));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add to cart';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH — update quantity of a cart item
export async function PATCH(req: NextRequest) {
  try {
    const { authUserId, cart_item_id, quantity } = await req.json();
    if (!authUserId || !cart_item_id || quantity === undefined)
      return NextResponse.json({ error: 'authUserId, cart_item_id, quantity required' }, { status: 400 });

    if (quantity <= 0) {
      await supabaseRequest(`cart_items?id=eq.${cart_item_id}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      });
    } else {
      await supabaseRequest(`cart_items?id=eq.${cart_item_id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ quantity }),
      });
    }

    const cartId = await upsertActiveCart(authUserId);
    const items = await supabaseRequest<DbCartItemRow[]>(
      `cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`
    );
    return NextResponse.json(formatCartResponse(cartId, items));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update cart';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove a specific item
export async function DELETE(req: NextRequest) {
  try {
    const { authUserId, cart_item_id } = await req.json();
    if (!authUserId || !cart_item_id)
      return NextResponse.json({ error: 'authUserId, cart_item_id required' }, { status: 400 });

    await supabaseRequest(`cart_items?id=eq.${cart_item_id}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });

    const cartId = await upsertActiveCart(authUserId);
    const items = await supabaseRequest<DbCartItemRow[]>(
      `cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`
    );
    return NextResponse.json(formatCartResponse(cartId, items));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to remove item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify GET in browser**

With a real authUserId (from Supabase Auth):
```
http://localhost:3000/api/cart?authUserId=<real-auth-user-id>
```
Expected: `{ "cart": { "id": "...", "items": [], "subtotal": 0, "processing_fee": 0, "total": 0 } }`

- [ ] **Step 3: Commit**

```bash
git add app/api/cart/route.ts
git commit -m "feat: add GET/POST/PATCH/DELETE /api/cart route"
```

---

## Task 8: Refactor CartContext to DB-backed

**Files:**
- Modify: `contexts/CartContext.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
// contexts/CartContext.tsx
"use client";

import React, {
  createContext, useContext, useState, useCallback, useEffect, ReactNode
} from 'react';
import { getCurrentUser } from '../lib/supabase-client';

export interface CartItem {
  id: string;           // cart_items.id (DB row id)
  campaign_id: string;
  title: string;
  price: number;        // face_value
  currency: string;
  quantity: number;
  imageSrc: string;
  imageAlt: string;
  category?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { campaign_id: string; title: string; price: number; imageSrc: string; imageAlt: string; category?: string }) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface ApiCartItem {
  id: string;
  campaign_id: string;
  title: string;
  category: string;
  cover_image_url: string | null;
  face_value: number;
  quantity: number;
}

interface ApiCartResponse {
  cart: {
    id: string;
    items: ApiCartItem[];
    subtotal: number;
    processing_fee: number;
    total: number;
  };
}

function toCartItem(item: ApiCartItem): CartItem {
  return {
    id: item.id,
    campaign_id: item.campaign_id,
    title: item.title,
    price: item.face_value,
    currency: '₱',
    quantity: item.quantity,
    imageSrc: item.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign',
    imageAlt: item.title,
    category: item.category,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load cart from DB on mount
  useEffect(() => {
    async function loadCart() {
      try {
        const user = await getCurrentUser();
        if (!user) { setLoading(false); return; }
        setAuthUserId(user.id);
        const res = await fetch(`/api/cart?authUserId=${user.id}`);
        const data: ApiCartResponse = await res.json();
        if (res.ok) setCart(data.cart.items.map(toCartItem));
      } catch {
        // silently fail — cart stays empty
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, []);

  const addToCart = useCallback(async (item: {
    campaign_id: string; title: string; price: number;
    imageSrc: string; imageAlt: string; category?: string;
  }) => {
    if (!authUserId) return;
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authUserId,
        campaign_id: item.campaign_id,
        face_value: item.price,
        quantity: 1,
      }),
    });
    const data: ApiCartResponse = await res.json();
    if (res.ok) setCart(data.cart.items.map(toCartItem));
  }, [authUserId]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!authUserId) return;
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authUserId, cart_item_id: cartItemId }),
    });
    const data: ApiCartResponse = await res.json();
    if (res.ok) setCart(data.cart.items.map(toCartItem));
  }, [authUserId]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!authUserId) return;
    const res = await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authUserId, cart_item_id: cartItemId, quantity }),
    });
    const data: ApiCartResponse = await res.json();
    if (res.ok) setCart(data.cart.items.map(toCartItem));
  }, [authUserId]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, loading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add contexts/CartContext.tsx
git commit -m "feat: refactor CartContext to sync with Supabase DB"
```

---

## Task 9: Update /basket page

**Files:**
- Modify: `app/basket/page.tsx`

- [ ] **Step 1: Remove local cart state and INITIAL_CART**

In `app/basket/page.tsx`:

Remove the local `CartItem` interface (it duplicates the one in CartContext).

Remove:
```typescript
const INITIAL_CART: CartItem[] = [...];
const TRAIN_LAW = { used: 15000, limit: 250000 };
```

Remove:
```typescript
const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
```

Remove `handleRemove` and `handleQuantityChange` local callbacks.

- [ ] **Step 2: Add CartContext import and hook**

At the top of the file, add:
```typescript
import { useCart, CartItem } from "../../contexts/CartContext";
```

Inside the `BasketPage` component, add:
```typescript
const { cart, removeFromCart, updateQuantity, cartTotal, loading } = useCart();
```

- [ ] **Step 3: Update subtotal and TRAIN_LAW**

Replace `const subtotal = cart.reduce(...)` with:
```typescript
const subtotal = cartTotal;
const trainUsedPercent = Math.round((subtotal / 250000) * 100);
```

- [ ] **Step 4: Wire remove and quantity handlers**

Replace `handleRemove(item.id)` calls with `removeFromCart(item.id)`.
Replace `handleQuantityChange(item.id, +1)` with `updateQuantity(item.id, item.quantity + 1)`.
Replace `handleQuantityChange(item.id, -1)` with `updateQuantity(item.id, Math.max(1, item.quantity - 1))`.

- [ ] **Step 5: Add loading state**

At the top of the JSX return, add before the cart content:
```tsx
{loading && (
  <p style={{ color: colors.onSurfaceVariant, padding: "2rem 0" }}>Loading basket...</p>
)}
```

- [ ] **Step 6: Verify in browser**

Open `http://localhost:3000/basket`. The cart should load from DB (empty for a new user). Adding a campaign from `/explore` should persist the item to DB and show in the basket.

- [ ] **Step 7: Commit**

```bash
git add app/basket/page.tsx
git commit -m "feat: wire /basket page to DB-backed CartContext"
```

---

## Task 10: GET /api/impact

**Files:**
- Create: `app/api/impact/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// app/api/impact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseRequest } from '../../../lib/hopecard-supabase';

interface DbProfile {
  total_donations_amount: number;
  total_donations_count: number;
  first_name: string;
}

interface DbPurchase {
  id: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  purchased_at: string;
  hopecards: {
    hc_campaigns: { title: string } | null;
  } | null;
}

export async function GET(req: NextRequest) {
  try {
    const authUserId = req.nextUrl.searchParams.get('authUserId');
    if (!authUserId) return NextResponse.json({ error: 'authUserId required' }, { status: 400 });

    const [profiles, purchases] = await Promise.all([
      supabaseRequest<DbProfile[]>(
        `digital_donor_profiles?auth_user_id=eq.${authUserId}&select=total_donations_amount,total_donations_count,first_name&limit=1`
      ),
      supabaseRequest<DbPurchase[]>(
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

    return NextResponse.json({
      first_name: profile.first_name,
      stats: {
        total_donations_amount: totalAmount,
        total_donations_count: Number(profile.total_donations_count),
        lives_touched: Math.floor(totalAmount / 500),
      },
      donation_history: donationHistory,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load impact data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify in browser**

```
http://localhost:3000/api/impact?authUserId=<real-auth-user-id>
```
Expected: `{ "first_name": "...", "stats": { "total_donations_amount": 0, ... }, "donation_history": [...] }`

- [ ] **Step 3: Commit**

```bash
git add app/api/impact/route.ts
git commit -m "feat: add GET /api/impact route"
```

---

## Task 11: useImpact hook

**Files:**
- Create: `hooks/useImpact.ts`

- [ ] **Step 1: Create the hook**

```typescript
// hooks/useImpact.ts
'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/supabase-client';

export interface ImpactStats {
  total_donations_amount: number;
  total_donations_count: number;
  lives_touched: number;
}

export interface DonationHistoryItem {
  id: string;
  campaign_title: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  purchased_at: string;
}

export interface ImpactData {
  first_name: string;
  stats: ImpactStats;
  donation_history: DonationHistoryItem[];
}

export function useImpact() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();
        if (!user) { setLoading(false); return; }
        const res = await fetch(`/api/impact?authUserId=${user.id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load impact data');
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { data, loading, error };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useImpact.ts
git commit -m "feat: add useImpact client hook"
```

---

## Task 12: Update /transactions page

**Files:**
- Modify: `app/transactions/page.tsx`

- [ ] **Step 1: Add hook import and remove hardcoded constants**

At the top of the file, add:
```typescript
import { useImpact } from "../../hooks/useImpact";
```

Remove the following hardcoded constants entirely:
- `KINDRED` object
- `IMPACT` object
- `REWARDS` object
- `DONATION_HISTORY` array
- `POINTS_ACTIVITY` array
- `PointsActivityItem` interface (unused after removal)

Remove unused imports: `Star`, `TrendingUp`, `Gift`, `CheckCircle` (keep `MapPin`, `Clock`, `CheckCircle` if used for status icons).

- [ ] **Step 2: Add hook call inside the component**

Inside `TransactionsPage`, after `const router = useRouter()`, add:
```typescript
const { data, loading, error } = useImpact();
```

- [ ] **Step 3: Replace the page header**

Replace:
```tsx
<h1 ...>Welcome home, Sarah.</h1>
```
With:
```tsx
<h1 ...>Welcome home, {data?.first_name ?? ''}.</h1>
```

- [ ] **Step 4: Replace the Impact Record card**

Replace the hardcoded `IMPACT.livesTouched` and `IMPACT.description` with:
```tsx
{data?.stats.lives_touched ?? 0} Lives Touched
```
And replace the description:
```tsx
Through your contributions to HOPECARD, you've helped {data?.stats.lives_touched ?? 0} individuals this year.
```

- [ ] **Step 5: Remove Kindred Status card and Rewards section**

Delete the entire JSX blocks for:
- The "Kindred Status" card (the left card in the hero grid)
- The "Rewards Section" `<section>` block

Update the hero grid to be single-column (just the Impact Record):
```tsx
<div style={{ marginBottom: "3rem" }}>
  {/* Impact Record — full width */}
  ...
</div>
```

- [ ] **Step 6: Remove Points Activity section**

In the history grids section, remove the entire "Points Activity" `<section>` block. Change the grid to single column:
```tsx
<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
```

- [ ] **Step 7: Wire Donation History**

Replace the `DONATION_HISTORY.map(...)` block with:

```tsx
{loading && <p style={{ color: colors.onSurfaceVariant }}>Loading history...</p>}
{error && <p style={{ color: colors.secondary }}>Could not load donation history.</p>}
{!loading && (data?.donation_history ?? []).map((item) => {
  const isProcessed = item.status === 'paid';
  return (
    <div key={item.id} style={{ background: colors.surfaceContainerLow, padding: "1.25rem", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = colors.surfaceContainerLowest; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = colors.surfaceContainerLow; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: "3rem", height: "3rem", background: colors.surfaceContainerLowest, borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {isProcessed ? <CheckCircle size={20} color={colors.secondary} /> : <Clock size={20} color={colors.onSurfaceVariant} />}
        </div>
        <div>
          <h4 style={{ fontWeight: 700, color: colors.onSurface, marginBottom: "0.125rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.campaign_title}</h4>
          <p style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant }}>{new Date(item.purchased_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontWeight: 800, color: colors.onSurface, marginBottom: "0.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>₱{item.amount_paid.toLocaleString()}</p>
        <span style={{ fontSize: "0.625rem", padding: "0.25rem 0.5rem", borderRadius: "999px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: isProcessed ? `${colors.secondaryContainer}33` : colors.surfaceContainerHigh, color: isProcessed ? colors.onSecondaryContainer : colors.onSurfaceVariant }}>
          {isProcessed ? 'Processed' : item.status}
        </span>
      </div>
    </div>
  );
})}
{!loading && (data?.donation_history ?? []).length === 0 && (
  <p style={{ color: colors.onSurfaceVariant }}>No donations yet.</p>
)}
```

- [ ] **Step 8: Verify in browser**

Open `http://localhost:3000/transactions`. The page should show real first name, real lives touched count, and real donation history.

- [ ] **Step 9: Commit**

```bash
git add app/transactions/page.tsx
git commit -m "feat: wire /transactions page to live impact data"
```

---

## Task 13: GET/PATCH /api/profile

**Files:**
- Create: `app/api/profile/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseRequest } from '../../../lib/hopecard-supabase';
import { getStorageUrl } from '../../../lib/storage-url';

interface DbProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  barangay: string | null;
  municipality: string | null;
  province: string | null;
  profile_photo_key: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const authUserId = req.nextUrl.searchParams.get('authUserId');
    if (!authUserId) return NextResponse.json({ error: 'authUserId required' }, { status: 400 });

    const rows = await supabaseRequest<DbProfile[]>(
      `digital_donor_profiles?auth_user_id=eq.${authUserId}&select=id,first_name,last_name,phone,address,barangay,municipality,province,profile_photo_key&limit=1`
    );

    if (rows.length === 0) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const row = rows[0];
    return NextResponse.json({
      profile: {
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone ?? '',
        address: row.address ?? '',
        barangay: row.barangay ?? '',
        municipality: row.municipality ?? '',
        province: row.province ?? '',
        profile_photo_url: getStorageUrl('profiles', row.profile_photo_key),
        profile_photo_key: row.profile_photo_key ?? '',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { authUserId, phone, address, barangay, municipality, province, profile_photo_key } = await req.json();
    if (!authUserId) return NextResponse.json({ error: 'authUserId required' }, { status: 400 });

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (barangay !== undefined) updates.barangay = barangay;
    if (municipality !== undefined) updates.municipality = municipality;
    if (province !== undefined) updates.province = province;
    if (profile_photo_key !== undefined) updates.profile_photo_key = profile_photo_key;

    await supabaseRequest(
      `digital_donor_profiles?auth_user_id=eq.${authUserId}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(updates),
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify in browser**

```
http://localhost:3000/api/profile?authUserId=<real-auth-user-id>
```
Expected: `{ "profile": { "first_name": "...", "phone": "", ... } }`

- [ ] **Step 3: Commit**

```bash
git add app/api/profile/route.ts
git commit -m "feat: add GET/PATCH /api/profile route"
```

---

## Task 14: useProfile hook

**Files:**
- Create: `hooks/useProfile.ts`

- [ ] **Step 1: Create the hook**

```typescript
// hooks/useProfile.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../lib/supabase-client';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  profile_photo_url: string | null;
  profile_photo_key: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();
        if (!user) { setLoading(false); return; }
        setAuthUserId(user.id);
        const res = await fetch(`/api/profile?authUserId=${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load profile');
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const saveProfile = useCallback(async (updates: Partial<Omit<UserProfile, 'id' | 'profile_photo_url'>>) => {
    if (!authUserId) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authUserId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      setProfile((prev) => prev ? { ...prev, ...updates } : prev);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [authUserId]);

  return { profile, loading, error, saving, saveError, saveSuccess, saveProfile, authUserId };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useProfile.ts
git commit -m "feat: add useProfile client hook"
```

---

## Task 15: Update /settings HopecardSettings

**Files:**
- Modify: `app/settings/HopecardSettings.tsx`

- [ ] **Step 1: Add imports**

At the top of `HopecardSettings.tsx`, add:
```typescript
import { useProfile } from "../../hooks/useProfile";
import { supabase } from "../../lib/supabase-client";
```

- [ ] **Step 2: Add hook and state inside the component**

Inside `HopecardSettings`, after the existing `useState` calls, add:

```typescript
const { profile, loading: profileLoading, saving, saveError, saveSuccess, saveProfile, authUserId } = useProfile();

const [phone, setPhone] = useState('');
const [address, setAddress] = useState('');
const [barangay, setBarangay] = useState('');
const [municipality, setMunicipality] = useState('');
const [province, setProvince] = useState('');
const [photoUploading, setPhotoUploading] = useState(false);

// Sync state when profile loads
React.useEffect(() => {
  if (profile) {
    setPhone(profile.phone);
    setAddress(profile.address);
    setBarangay(profile.barangay);
    setMunicipality(profile.municipality);
    setProvince(profile.province);
  }
}, [profile]);
```

- [ ] **Step 3: Add password change state**

Add state for the password change form:
```typescript
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [passwordError, setPasswordError] = useState('');
const [passwordSuccess, setPasswordSuccess] = useState(false);
const [passwordSaving, setPasswordSaving] = useState(false);
```

- [ ] **Step 4: Add save handler for personal info**

```typescript
const handleSavePersonalInfo = useCallback(async () => {
  await saveProfile({ phone, address, barangay, municipality, province });
}, [saveProfile, phone, address, barangay, municipality, province]);
```

- [ ] **Step 5: Add profile photo upload handler**

```typescript
const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !authUserId) return;
  setPhotoUploading(true);
  try {
    const key = `${authUserId}/profile.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('profiles').upload(key, file, { upsert: true });
    if (error) throw error;
    await saveProfile({ profile_photo_key: key });
  } catch {
    // silently fail — user sees no change
  } finally {
    setPhotoUploading(false);
  }
}, [authUserId, saveProfile]);
```

- [ ] **Step 6: Add password change handler**

```typescript
const handleChangePassword = useCallback(async () => {
  setPasswordError('');
  setPasswordSuccess(false);
  if (newPassword !== confirmPassword) {
    setPasswordError('New passwords do not match.');
    return;
  }
  if (newPassword.length < 8) {
    setPasswordError('Password must be at least 8 characters.');
    return;
  }
  setPasswordSaving(true);
  try {
    const res = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to update password');
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  } catch (err) {
    setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
  } finally {
    setPasswordSaving(false);
  }
}, [currentPassword, newPassword, confirmPassword]);
```

- [ ] **Step 7: Replace the Account & Security SectionCard content**

Find the `<SectionCard icon={<Shield ...>} title="Account & Security">` block and replace its inner content with:

```tsx
<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
  {/* Password Change */}
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
    <PasswordField
      label="Current Password"
      value={currentPassword}
      onChange={(v) => setCurrentPassword(v)}
    />
    <PasswordField
      label="New Password"
      value={newPassword}
      onChange={(v) => setNewPassword(v)}
    />
    <PasswordField
      label="Confirm New Password"
      colSpan2
      value={confirmPassword}
      onChange={(v) => setConfirmPassword(v)}
    />
  </div>
  {passwordError && <p style={{ color: C.secondary, fontSize: "0.875rem", margin: 0 }}>{passwordError}</p>}
  {passwordSuccess && <p style={{ color: C.tertiary, fontSize: "0.875rem", margin: 0 }}>Password updated successfully.</p>}
  <button
    onClick={handleChangePassword}
    disabled={passwordSaving}
    style={{ alignSelf: "flex-start", background: C.primaryContainer, color: C.onPrimaryContainer, border: "none", borderRadius: "0.75rem", padding: "0.75rem 1.5rem", fontWeight: 700, cursor: "pointer", fontFamily: "Manrope, sans-serif", opacity: passwordSaving ? 0.7 : 1 }}
  >
    {passwordSaving ? 'Saving...' : 'Update Password'}
  </button>
  {/* Biometric toggle stays as-is */}
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0", borderTop: `1px solid ${C.outlineVariant}1a` }}>
    <div>
      <p style={{ fontWeight: 600, color: C.onSurface, margin: "0 0 0.125rem", fontFamily: "Manrope, sans-serif" }}>Biometric Login</p>
      <p style={{ fontSize: "0.875rem", color: C.onSurfaceVariant, margin: 0, fontFamily: "Manrope, sans-serif" }}>Use FaceID or Fingerprint for faster access</p>
    </div>
    <Toggle enabled={biometric} onChange={toggle(setBiometric)} />
  </div>
</div>
```

- [ ] **Step 8: Update PasswordField to be controlled**

The existing `PasswordField` component has no `value`/`onChange`. Update its props and implementation:

Find the `PasswordField` component and update:
```typescript
interface PasswordFieldProps {
  label: string;
  colSpan2?: boolean;
  value: string;
  onChange: (value: string) => void;
}

const PasswordField = React.memo<PasswordFieldProps>(({ label, colSpan2 = false, value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", gridColumn: colSpan2 ? "1 / -1" : undefined }}>
    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: C.onSurfaceVariant, marginLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>
      {label}
    </label>
    <input
      type="password"
      placeholder="••••••••"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", background: C.surfaceContainerHighest, border: "none", borderRadius: "1rem", padding: "1rem 1.25rem", outline: "none", fontFamily: "Manrope, sans-serif", fontSize: "1rem", color: "#000000" }}
      onFocus={(e) => { e.currentTarget.style.background = C.surfaceContainerLowest; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(151,69,62,0.15)"; }}
      onBlur={(e) => { e.currentTarget.style.background = C.surfaceContainerHighest; e.currentTarget.style.boxShadow = "none"; }}
    />
  </div>
));
PasswordField.displayName = "PasswordField";
```

- [ ] **Step 9: Add a Personal Info section above Account & Security**

Before the Account & Security `<SectionCard>`, insert a new section:

```tsx
{/* ── Personal Information ───────────────────────────────────────── */}
<SectionCard icon={<SettingsIcon size={22} color={C.primary} />} title="Personal Information">
  {profileLoading ? (
    <p style={{ color: C.onSurfaceVariant, fontFamily: "Manrope, sans-serif" }}>Loading profile...</p>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Profile Photo */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ width: "5rem", height: "5rem", borderRadius: "999px", background: C.surfaceContainerHigh, overflow: "hidden", flexShrink: 0 }}>
          {profile?.profile_photo_url ? (
            <img src={profile.profile_photo_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.onSurfaceVariant, fontSize: "2rem" }}>
              {profile?.first_name?.[0] ?? '?'}
            </div>
          )}
        </div>
        <div>
          <p style={{ fontWeight: 700, color: C.onSurface, marginBottom: "0.25rem", fontFamily: "Manrope, sans-serif" }}>
            {profile?.first_name} {profile?.last_name}
          </p>
          <label style={{ cursor: "pointer", fontSize: "0.875rem", color: C.primary, fontWeight: 600, fontFamily: "Manrope, sans-serif" }}>
            {photoUploading ? 'Uploading...' : 'Change Photo'}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} disabled={photoUploading} />
          </label>
        </div>
      </div>

      {/* Fields grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {[
          { label: "Phone Number", value: phone, setter: setPhone },
          { label: "Address", value: address, setter: setAddress },
          { label: "Barangay", value: barangay, setter: setBarangay },
          { label: "Municipality", value: municipality, setter: setMunicipality },
          { label: "Province", value: province, setter: setProvince },
        ].map(({ label, value, setter }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 500, color: C.onSurfaceVariant, marginLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              style={{ width: "100%", background: C.surfaceContainerHighest, border: "none", borderRadius: "1rem", padding: "1rem 1.25rem", outline: "none", fontFamily: "Manrope, sans-serif", fontSize: "1rem", color: C.onSurface, boxSizing: "border-box" }}
              onFocus={(e) => { e.currentTarget.style.background = C.surfaceContainerLowest; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(151,69,62,0.15)"; }}
              onBlur={(e) => { e.currentTarget.style.background = C.surfaceContainerHighest; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
        ))}
      </div>

      {saveError && <p style={{ color: C.secondary, fontSize: "0.875rem", margin: 0 }}>{saveError}</p>}
      {saveSuccess && <p style={{ color: C.tertiary, fontSize: "0.875rem", margin: 0 }}>Profile saved successfully.</p>}
      <button
        onClick={handleSavePersonalInfo}
        disabled={saving}
        style={{ alignSelf: "flex-start", background: C.primaryContainer, color: C.onPrimaryContainer, border: "none", borderRadius: "0.75rem", padding: "0.75rem 1.5rem", fontWeight: 700, cursor: "pointer", fontFamily: "Manrope, sans-serif", opacity: saving ? 0.7 : 1 }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )}
</SectionCard>
```

- [ ] **Step 10: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 11: Verify in browser**

Open `http://localhost:3000/settings`. The Personal Information section should load real profile data. Editing fields and clicking Save should update the DB. Changing password should call the existing update-password route.

- [ ] **Step 12: Commit**

```bash
git add app/settings/HopecardSettings.tsx
git commit -m "feat: wire /settings page to live profile data with edit + photo upload"
```

---

## Task 16: Update DonationModal to use new addToCart signature

**Files:**
- Modify: `components/DonationModal.tsx`

The new `addToCart` in CartContext requires `campaign_id` instead of `id`, and drops `currency`. DonationModal must be updated to match.

- [ ] **Step 1: Update the addToCart call inside handleAddToCart**

In `components/DonationModal.tsx`, find the `handleAddToCart` callback. It currently calls:

```typescript
addToCart({
  id: `${campaign.id}-${Date.now()}`,
  title: campaign.title,
  price: amount,
  currency: "₱",
  imageSrc: campaign.imageSrc,
  imageAlt: campaign.description,
  category: campaign.category,
});
```

Replace it with:

```typescript
addToCart({
  campaign_id: campaign.id,
  title: campaign.title,
  price: amount,
  imageSrc: campaign.imageSrc,
  imageAlt: campaign.description,
  category: campaign.category,
});
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Verify in browser**

Open `/explore`, click a campaign card, select an amount in the modal, click "Add to Cart". The cart icon count in the header should increase. Open `/basket` — the item should appear and persist on refresh.

- [ ] **Step 4: Commit**

```bash
git add components/DonationModal.tsx
git commit -m "fix: update DonationModal to use new campaign_id addToCart signature"
```

---

## Final Verification

- [ ] **Visit all five pages while logged in and confirm no hardcoded data remains:**
  - `/home` — campaigns from DB
  - `/explore` — campaigns from DB, filter works
  - `/basket` — empty cart loads, add from /explore persists
  - `/transactions` — real first name, real donation history
  - `/settings` — real personal info, password change works

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: complete backend integration for all logged-in pages"
```
