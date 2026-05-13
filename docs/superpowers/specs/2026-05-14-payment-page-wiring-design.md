# Payment Page Wiring Design

**Date:** 2026-05-14
**Scope:** Wire `payment/page.tsx` to real cart data and the purchases API. No new files. No stock validation.

---

## Problem

`payment/page.tsx` currently shows two hardcoded `ORDER_ITEMS` and a `handleComplete` that only calls `router.push('/payment/success')` — it never reads from the cart or calls the purchases API.

---

## Solution

### CartContext (`contexts/CartContext.tsx`)

Add `checkout(paymentMethod: string): Promise<void>` to `CartContextType` and implement it inside `CartProvider`.

Steps:
1. Guard: if `authUserId` is not set, throw `"Not authenticated"`.
2. Build payload:
   ```ts
   checkoutItems = cart.map(item => ({
     cardId: item.campaign_id,
     title: item.title,
     amount: item.price,
     quantity: item.quantity,
   }))
   ```
3. `POST /api/purchases` with body `{ buyerAuthId: authUserId, paymentMethod, checkoutItems }` and header `Authorization: Bearer <accessToken>`.
4. On HTTP 2xx: call `clearCart()`.
5. On error: parse `data.error` and throw so the caller can handle it.

### Payment Page (`app/payment/page.tsx`)

1. Import `useCart`, destructure `cart`, `cartTotal`, `processingFee`, `apiTotal`, `loading`, `checkout`.
2. Remove `ORDER_ITEMS` constant and `TRAIN_PERCENT` hardcode.
3. Derive values:
   - `total = apiTotal > 0 ? apiTotal : cartTotal`
   - `trainPct = Math.min(100, (cartTotal / 250_000) * 100)`
4. Render `cart` items in the Donation Summary sidebar.
5. Add local `submitting: boolean` and `submitError: string | null` state.
6. `handleComplete` becomes async:
   ```ts
   async function handleComplete() {
     setSubmitting(true);
     setSubmitError(null);
     try {
       await checkout(activeMethod);
       router.push('/payment/success');
     } catch (e) {
       setSubmitError(e instanceof Error ? e.message : 'Payment failed');
     } finally {
       setSubmitting(false);
     }
   }
   ```
7. "Complete Donation" button: disabled + label changes to "Processing…" while `submitting` is true.
8. Render `submitError` as an inline error message below the button if set.

---

## Data Flow

```
payment/page.tsx
  └─ useCart() → { cart, cartTotal, processingFee, apiTotal, checkout }
       └─ checkout(paymentMethod)
            ├─ POST /api/purchases → api-gateway → payment-service → Supabase
            └─ clearCart() on success
  └─ router.push('/payment/success') after checkout resolves
```

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| User not logged in | `checkout()` throws "Not authenticated"; error shown inline |
| Empty cart | `checkout()` throws (payment-service rejects empty `checkoutItems`); error shown inline |
| Network / API error | Error message surfaced inline; button re-enabled |
| Success | Cart cleared, navigate to `/payment/success` |

---

## Files Changed

| File | Change |
|---|---|
| `apps/frontend/contexts/CartContext.tsx` | Add `checkout` to type + provider |
| `apps/frontend/app/payment/page.tsx` | Replace hardcoded data; wire `checkout` call |

No new files. No other services changed.
