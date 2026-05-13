# Payment Page Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `payment/page.tsx` to real cart data and call `POST /api/purchases` on submit, clearing the cart on success.

**Architecture:** Add a `checkout(paymentMethod)` function to `CartContext` that owns the purchases API call and cart-clearing. The payment page reads cart data and calls `checkout` — it holds no API logic itself.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Supabase Auth (for the session token already stored in CartContext)

---

## File Map

| File | Change |
|---|---|
| `apps/frontend/contexts/CartContext.tsx` | Add `checkout` to `CartContextType` and implement in `CartProvider` |
| `apps/frontend/app/payment/page.tsx` | Replace hardcoded `ORDER_ITEMS`; read from `useCart()`; wire `handleComplete` to `checkout` |

---

## Task 1: Add `checkout` to CartContext

**Files:**
- Modify: `apps/frontend/contexts/CartContext.tsx`

- [ ] **Step 1: Add `checkout` to `CartContextType`**

In `CartContextType` (line 20–31), add one field after `apiTotal`:

```ts
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { campaign_id: string; title: string; price: number; imageSrc: string; imageAlt: string; category?: string }) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  processingFee: number;
  apiTotal: number;
  checkout: (paymentMethod: string) => Promise<void>;
}
```

- [ ] **Step 2: Implement `checkout` in `CartProvider`**

After the existing `clearCart` declaration (line 158), add:

```ts
const checkout = useCallback(async (paymentMethod: string) => {
  if (!authUserId) throw new Error('Not authenticated');
  const checkoutItems = cart.map((item) => ({
    cardId: item.campaign_id,
    title: item.title,
    amount: item.price,
    quantity: item.quantity,
  }));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://127.0.0.1:5000'}/api/purchases`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ buyerAuthId: authUserId, paymentMethod, checkoutItems }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Checkout failed');
  clearCart();
}, [authUserId, accessToken, cart, clearCart]);
```

- [ ] **Step 3: Expose `checkout` in context value**

Replace the `CartContext.Provider value` prop (lines 164–167):

```tsx
<CartContext.Provider value={{
  cart, addToCart, removeFromCart, updateQuantity, clearCart,
  cartCount, cartTotal, loading, processingFee, apiTotal, checkout,
}}>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run from `apps/frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors (or only pre-existing unrelated errors).

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/contexts/CartContext.tsx
git commit -m "feat(cart): add checkout() to CartContext — calls purchases API and clears cart on success"
```

---

## Task 2: Wire payment page to real cart data

**Files:**
- Modify: `apps/frontend/app/payment/page.tsx`

- [ ] **Step 1: Import `useCart` and add cart state**

At the top of the file, after the existing React/router imports, add:

```ts
import { useCart } from "../../contexts/CartContext";
```

Inside `PaymentPage()`, after the `router` and existing `useState` declarations, add:

```ts
const { cart, cartTotal, processingFee, apiTotal, loading: cartLoading, checkout } = useCart();
const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);
```

- [ ] **Step 2: Remove hardcoded constants, derive values from cart**

Delete these lines entirely:
```ts
const ORDER_ITEMS = [
  { id: "o1", label: "01x Rural Education Fund", category: "Education Support", amount: 5000, currency: "₱" },
  { id: "o2", label: "02x Reforestation Project", category: "Environment Growth", amount: 5000, currency: "₱" },
];
```
```ts
const TRAIN_PERCENT = 4;
```
```ts
const total = ORDER_ITEMS.reduce((sum, i) => sum + i.amount, 0);
const currency = ORDER_ITEMS[0]?.currency ?? "₱";
```

Replace them with:
```ts
const currency = "₱";
const total = apiTotal > 0 ? apiTotal : cartTotal;
const trainPct = Math.min(100, (cartTotal / 250_000) * 100);
```

- [ ] **Step 3: Replace `handleComplete` with async checkout call**

Replace the existing `handleComplete`:
```ts
const handleComplete = useCallback(() => {
  router.push('/payment/success');
}, [router]);
```

With:
```ts
const handleComplete = useCallback(async () => {
  setSubmitting(true);
  setSubmitError(null);
  try {
    await checkout(activeMethod);
    router.push('/payment/success');
  } catch (e) {
    setSubmitError(e instanceof Error ? e.message : 'Payment failed. Please try again.');
  } finally {
    setSubmitting(false);
  }
}, [checkout, activeMethod, router]);
```

- [ ] **Step 4: Replace hardcoded Donation Summary items with cart items**

Find the `{ORDER_ITEMS.map(...)}` block in the right sidebar (approx lines 317–330):

```tsx
{ORDER_ITEMS.map((item) => (
  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
    <div>
      <p style={{ fontWeight: 700, color: colors.onSurface, marginBottom: "0.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.label}</p>
      <p style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Manrope, sans-serif" }}>
        {item.category}
      </p>
    </div>
    <p style={{ fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      {item.currency}{item.amount.toLocaleString()}
    </p>
  </div>
))}
```

Replace with:
```tsx
{cartLoading && (
  <p style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem" }}>Loading cart…</p>
)}
{!cartLoading && cart.length === 0 && (
  <p style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem" }}>Your cart is empty.</p>
)}
{cart.map((item) => (
  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
    <div>
      <p style={{ fontWeight: 700, color: colors.onSurface, marginBottom: "0.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        {String(item.quantity).padStart(2, "0")}x {item.title}
      </p>
      <p style={{ fontSize: "0.75rem", color: colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Manrope, sans-serif" }}>
        {item.category ?? "Campaign"}
      </p>
    </div>
    <p style={{ fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      {currency}{(item.price * item.quantity).toLocaleString()}
    </p>
  </div>
))}
```

- [ ] **Step 5: Wire TRAIN Law section to real `trainPct`**

Find the hardcoded TRAIN Law block. Replace `TRAIN_PERCENT` (appears twice) with `trainPct`:

```tsx
<p style={{ fontSize: "1.125rem", fontWeight: 800, color: colors.tertiary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{trainPct.toFixed(2)}%</p>
```

and:

```tsx
<div style={{ height: "100%", width: `${trainPct}%`, background: colors.tertiaryContainer, borderRadius: "999px" }} />
```

- [ ] **Step 6: Update Subtotal / Processing Fee rows**

Find the summary totals section. Replace the hardcoded fee display:

```tsx
<span style={{ fontWeight: 500, color: colors.secondaryContainer }}>{currency}0</span>
```

With:
```tsx
<span style={{ fontWeight: 500, color: colors.secondaryContainer }}>{currency}{processingFee.toLocaleString()}</span>
```

- [ ] **Step 7: Disable button and show error during submission**

Replace the "Complete Donation" button:
```tsx
<button
  onClick={handleComplete}
  style={{
    width: "100%",
    height: "4rem",
    background: colors.primaryContainer,
    color: colors.onPrimaryContainer,
    borderRadius: "1rem",
    fontWeight: 700,
    fontSize: "1.125rem",
    border: "none",
    cursor: "pointer",
    boxShadow: `0 8px 20px ${colors.primaryContainer}33`,
    transition: "transform 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
>
  <Heart size={20} fill="currentColor" /> Complete Donation
</button>
```

With:
```tsx
<button
  onClick={handleComplete}
  disabled={submitting || cart.length === 0}
  style={{
    width: "100%",
    height: "4rem",
    background: submitting || cart.length === 0 ? colors.surfaceContainerHigh : colors.primaryContainer,
    color: submitting || cart.length === 0 ? colors.onSurfaceVariant : colors.onPrimaryContainer,
    borderRadius: "1rem",
    fontWeight: 700,
    fontSize: "1.125rem",
    border: "none",
    cursor: submitting || cart.length === 0 ? "not-allowed" : "pointer",
    boxShadow: submitting || cart.length === 0 ? "none" : `0 8px 20px ${colors.primaryContainer}33`,
    transition: "transform 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  }}
  onMouseEnter={(e) => { if (!submitting && cart.length > 0) e.currentTarget.style.transform = "scale(1.02)"; }}
  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
>
  <Heart size={20} fill="currentColor" />
  {submitting ? "Processing…" : "Complete Donation"}
</button>
{submitError && (
  <p style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.875rem", color: colors.secondary, fontWeight: 600 }}>
    {submitError}
  </p>
)}
```

- [ ] **Step 8: Verify TypeScript compiles**

Run from `apps/frontend/`:
```bash
npx tsc --noEmit
```
Expected: no errors (or only pre-existing unrelated errors).

- [ ] **Step 9: Manual smoke test**

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd apps/frontend && npm run dev`
3. Log in, navigate to `/explore`
4. Click a campaign → select an amount → click "Add to Cart" → modal closes
5. Click cart icon in nav → `/basket` loads with the item
6. Click "Complete Donation" → `/payment` loads showing real cart item(s) with correct total
7. Select a payment method, click "Complete Donation" → button shows "Processing…"
8. On success → redirected to `/payment/success`, cart badge clears to 0
9. Navigate back to `/basket` → cart is empty

- [ ] **Step 10: Commit**

```bash
git add apps/frontend/app/payment/page.tsx
git commit -m "feat(payment): wire payment page to cart context and purchases API"
```
