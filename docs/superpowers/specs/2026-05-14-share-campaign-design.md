# Share Campaign Design

**Date:** 2026-05-14
**Scope:** Share link generation, copy-to-clipboard, and Facebook Sharer popup for campaign cards and the donation success page. No Facebook Graph API, no new backend routes, no DB changes.

---

## Problem

The "Share Your Impact" button on the success page is a stub (`console.log`). Campaign cards have no share action. Users have no way to share campaigns with a pre-filled caption and link.

---

## Solution

### New Component: `ShareModal` (`apps/frontend/components/ShareModal.tsx`)

A reusable modal following the existing `DonationModal` two-panel layout pattern.

**Props:**
```ts
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    category: string;
    cover_image_url: string;
  };
}
```

**Share URL:**
```
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/explore?campaign_id=${campaign.id}&utm_medium=facebook&utm_source=share
```

**Pre-made caption:**
```
I'm supporting "${campaign.title}" on Hopecard — a platform connecting donors with verified local causes. Every contribution counts 💙
```

**Internal state:**
- `copiedLink: boolean` — resets to `false` after 2 seconds via `setTimeout`
- `copiedCaption: boolean` — same pattern

**Layout:**
- **Left panel** — campaign cover image filling the panel height, category pill top-left, gradient overlay bottom-to-top
- **Right panel** — header ("Share This Campaign" / close button), caption block (read-only textarea style, "Copy Caption" button), share link row (read-only input, "Copy Link" button), "Share on Facebook" CTA at bottom

**Copy behaviour:** `navigator.clipboard.writeText(text)`. On success: button label changes to "Copied!" for 2 seconds then reverts.

**Facebook button:**
```ts
const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(caption)}`;
window.open(fbUrl, '_blank', 'width=600,height=500,resizable=yes');
```
Opens in a 600×500 popup. User is already logged into Facebook in their browser and just clicks "Post".

---

### Integration Point 1: Explore page (`app/explore/page.tsx`)

- Add `selectedShareCampaign` state: `{ id, title, category, cover_image_url } | null`
- Add `shareModalOpen: boolean` state
- Each campaign card: add a `Share2` icon button to the bottom action row, to the left of the existing "Support" button
- `ShareModal` rendered at page root alongside existing `DonationModal`

### Integration Point 2: Home page (`app/home/page.tsx`)

- Add `selectedShareCampaign` and `shareModalOpen` state at page level
- `CampaignCard` receives an `onShare` callback prop
- Share icon button overlaid top-right of the card image (same corner as category pill but opposite side)
- `ShareModal` rendered at page root

### Integration Point 3: Success page (`app/payment/success/page.tsx`)

- Replace `handleShare` stub with: `setShareModalOpen(true)`
- Add `shareModalOpen: boolean` state
- Campaign data sourced from `cart[0]`: `{ id: cart[0].campaign_id, title: cart[0].title, category: cart[0].category ?? 'Campaign', cover_image_url: cart[0].imageSrc }`
- `ShareModal` rendered conditionally at page root
- When `cart` is empty (user navigated directly to success), share button remains hidden

---

## Data Flow

```
User clicks Share
  → ShareModal opens with campaign props
  → User clicks "Copy Link" → navigator.clipboard.writeText(shareUrl) → button shows "Copied!" for 2s
  → User clicks "Copy Caption" → navigator.clipboard.writeText(caption) → button shows "Copied!" for 2s
  → User clicks "Share on Facebook" → window.open(fbSharerUrl, popup) → Facebook dialog pre-filled → user clicks Post
```

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `navigator.clipboard` unavailable (non-HTTPS) | `document.execCommand('copy')` fallback |
| `window.open` blocked by popup blocker | No crash; button press is a no-op from user perspective — browser shows its own blocked popup notification |
| `cart` is empty on success page | Share button not rendered (conditional on `cart.length > 0`) |

---

## Files Changed

| File | Change |
|---|---|
| `apps/frontend/components/ShareModal.tsx` | New — reusable share modal |
| `apps/frontend/app/explore/page.tsx` | Add share button + `ShareModal` |
| `apps/frontend/app/home/page.tsx` | Add `onShare` to `CampaignCard` + `ShareModal` |
| `apps/frontend/app/payment/success/page.tsx` | Wire `handleShare` + add `ShareModal` |

No backend changes. No new DB tables.
