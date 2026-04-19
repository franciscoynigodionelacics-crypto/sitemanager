# Backend Integration Design: Logged-in User Pages

**Date:** 2026-04-19  
**Branch:** hopecard-backend-integration  
**Pages:** /home, /explore, /basket, /transactions (impact), /settings

---

## Overview

Replace all hardcoded data on the five main logged-in pages with live Supabase data. Each page gets a dedicated Next.js API route and a client-side data-fetching hook. No breaking changes to existing auth routes, purchase routes, or database RLS policies.

---

## 1. Database Changes

### 1.1 Add `category` to `hc_campaigns`

```sql
ALTER TABLE hc_campaigns
ADD COLUMN category TEXT CHECK (category IN ('health', 'education', 'environment', 'disaster'));
```

- Nullable — existing 8 rows are unaffected
- Populated manually by admin after migration
- Used for filtering on /home and /explore

### 1.2 No new tables

All required data is available in existing tables:
- `hc_campaigns` — campaigns for /home and /explore
- `carts` + `cart_items` — persistent basket
- `hopecard_purchases` + `digital_donor_profiles` — impact/transactions page
- `digital_donor_profiles` — settings page

### 1.3 Lives Touched formula

```
lives_touched = floor(digital_donor_profiles.total_donations_amount / 500)
```

₱500 = 1 life touched. Sourced from the existing `total_donations_amount` column.

---

## 2. API Routes

All routes are server-side (Next.js Route Handlers). They use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS, consistent with existing routes. Auth identity is extracted from the request body as `authUserId`.

### 2.1 `GET /api/campaigns`

Returns active campaigns from `hc_campaigns`.

**Query params:**
- `?category=health|education|environment|disaster` (optional)

**Response:**
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "category": "health",
      "target_amount": 100000,
      "collected_amount": 45000,
      "progress_pct": 45,
      "cover_image_url": "https://...",
      "status": "active",
      "end_date": "2026-12-31"
    }
  ]
}
```

**Logic:**
- Filter `status = 'active'`
- Filter by `category` if param provided
- Construct `cover_image_url` from `cover_image_key` via Supabase Storage public URL
- Compute `progress_pct = round((collected_amount / target_amount) * 100)`

---

### 2.2 `GET /api/cart`

Returns the authenticated user's active cart with items and campaign details.

**Request body:** `{ authUserId: string }`

**Response:**
```json
{
  "cart": {
    "id": "uuid",
    "items": [
      {
        "id": "cart_item_uuid",
        "campaign_id": "uuid",
        "title": "string",
        "category": "string",
        "cover_image_url": "string",
        "face_value": 500,
        "quantity": 2
      }
    ],
    "subtotal": 1000,
    "processing_fee": 15,
    "total": 1015
  }
}
```

**Logic:**
- Upsert `carts` row for user (status = 'active') if none exists
- Join `cart_items` with `hc_campaigns` for title, category, cover_image_url
- processing_fee = 1.5% of subtotal (matching existing UI)

---

### 2.3 `POST /api/cart`

Add an item to the cart.

**Request body:** `{ authUserId, campaign_id, face_value, quantity }`

**Logic:**
- Upsert active cart for user
- If campaign already in cart → increment quantity
- Else → insert new cart_item

---

### 2.4 `PATCH /api/cart`

Update quantity of a cart item.

**Request body:** `{ authUserId, cart_item_id, quantity }`

- If quantity = 0 → delete the item
- Else → update quantity

---

### 2.5 `DELETE /api/cart`

Remove a specific item from the cart.

**Request body:** `{ authUserId, cart_item_id }`

---

### 2.6 `GET /api/impact`

Returns donation history and impact stats for the authenticated user.

**Request body / query:** `?authUserId=`

**Response:**
```json
{
  "stats": {
    "total_donations_amount": 15000,
    "total_donations_count": 12,
    "lives_touched": 30
  },
  "donation_history": [
    {
      "id": "uuid",
      "campaign_title": "string",
      "amount_paid": 500,
      "payment_method": "gcash",
      "status": "paid",
      "purchased_at": "2026-03-01T10:00:00Z"
    }
  ]
}
```

**Logic:**
- Fetch `digital_donor_profiles` by `auth_user_id` for stats
- Fetch `hopecard_purchases` by `buyer_auth_id`, join `hc_campaigns` for title
- `lives_touched = floor(total_donations_amount / 500)`
- Kindred Status / points: not implemented — UI section hidden or shows placeholder

---

### 2.7 `GET /api/profile`

Returns the authenticated user's editable profile fields.

**Query:** `?authUserId=`

**Response:**
```json
{
  "profile": {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "address": "string",
    "barangay": "string",
    "municipality": "string",
    "province": "string",
    "profile_photo_url": "string"
  }
}
```

---

### 2.8 `PATCH /api/profile`

Update personal info and/or profile photo key.

**Request body:** `{ authUserId, phone?, address?, barangay?, municipality?, province?, profile_photo_key? }`

**Logic:**
- Partial update — only provided fields are updated
- Updates `updated_at` automatically
- Profile photo uploaded to Supabase Storage by client first; key sent in this request

---

## 3. Client-Side Hooks

Each hook lives in `/hooks/` and wraps `fetch` calls to the API routes. They handle loading and error states.

| Hook | File | Used by |
|---|---|---|
| `useCampaigns(category?)` | `hooks/useCampaigns.ts` | /home, /explore |
| `useCart()` | `hooks/useCart.ts` | /basket, CartContext |
| `useImpact()` | `hooks/useImpact.ts` | /transactions |
| `useProfile()` | `hooks/useProfile.ts` | /settings |

### CartContext extension

`CartContext` will be refactored to:
1. On mount: call `GET /api/cart` to load persisted cart
2. `addToCart` → call `POST /api/cart` → update local state
3. `removeFromCart` → call `DELETE /api/cart` → update local state
4. `updateQuantity` → call `PATCH /api/cart` → update local state

The Context interface (`CartContextType`) is unchanged — components consuming it require no modification.

---

## 4. Page Integration

### /home (`app/home/page.tsx`)
- Replace hardcoded `campaigns` array with `useCampaigns()` data
- Category filter pills trigger refetch with `?category=` param
- Loading state: skeleton cards (same layout as existing cards)
- Featured campaign: first `active` campaign returned

### /explore (`app/explore/page.tsx`)
- Same `useCampaigns()` hook, same filter behavior
- DonationModal `onAdd` calls `addToCart` from CartContext (which now persists to DB)

### /basket (`app/basket/page.tsx`)
- Replace hardcoded `initialItems` with CartContext (now DB-backed)
- Remove hardcoded TRAIN_LAW values — keep UI but derive from real totals
- "Complete Donation" flow unchanged

### /transactions (`app/transactions/page.tsx`)
- Replace hardcoded `KINDRED`, `IMPACT`, `REWARDS`, `donationHistory`, `pointsActivity` with `useImpact()` data
- Hide Kindred Status card and Points Activity section (not yet implemented)
- Show: stats card (total donated, donation count, lives touched) + donation history table

### /settings (`app/settings/page.tsx` + `HopecardSettings.tsx`)
- Load profile via `useProfile()`
- Editable fields: phone, address, barangay, municipality, province, profile photo
- Profile photo: upload to Supabase Storage → save key via `PATCH /api/profile`
- Password change: existing `POST /api/auth/update-password` (no change)
- Save triggers `PATCH /api/profile`

---

## 5. Error Handling

- Unauthenticated requests → 401 response
- Missing required fields → 400 response
- All API routes return `{ error: string }` on failure
- Client hooks expose `error` state; pages show inline error message (no crash)

---

## 6. What Is Not Changed

- All existing auth API routes (`/api/auth/*`)
- `/api/hopecard-purchases` (purchase creation and history)
- `SharedLayout.tsx` navigation and layout
- `DonationModal.tsx` component interface
- Supabase RLS policies (service role used server-side throughout)
- Kindred Status / points system (deferred)
- `/api/auth/update-password` (already exists, reused as-is)
