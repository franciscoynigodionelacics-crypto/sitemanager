# Share Campaign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a share modal with copy-to-clipboard and Facebook Sharer popup to campaign cards on the Explore and Home pages, and wire the existing stub button on the Success page.

**Architecture:** A new reusable `ShareModal` component (following the `DonationModal` two-panel pattern) is added to `components/`. It is mounted at the page root of three pages and opened via local state. No backend changes — the share URL is constructed client-side using `NEXT_PUBLIC_APP_URL`.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, lucide-react (Copy, Check, Share2, X icons), `navigator.clipboard` with `execCommand` fallback.

---

## File Map

| File | Change |
|---|---|
| `apps/frontend/components/ShareModal.tsx` | **New** — reusable share modal |
| `apps/frontend/app/explore/page.tsx` | Add share button per card + `ShareModal` |
| `apps/frontend/app/home/page.tsx` | Add `onShare` prop to `CampaignCard` + `ShareModal` |
| `apps/frontend/app/payment/success/page.tsx` | Wire `handleShare` + add `ShareModal` |

---

## Task 1: Create `ShareModal` component

**Files:**
- Create: `apps/frontend/components/ShareModal.tsx`

- [ ] **Step 1: Create the file with complete implementation**

Create `apps/frontend/components/ShareModal.tsx` with this exact content:

```tsx
"use client";

import React, { useState, useCallback } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";

const C = {
  primary:              "#97453e",
  primaryContainer:     "#f28d83",
  onPrimaryContainer:   "#6e2621",
  surface:              "#fcf9f8",
  surfaceContainerHigh: "#eae7e7",
  surfaceContainerLowest: "#ffffff",
  onSurface:            "#1b1c1b",
  onSurfaceVariant:     "#554240",
  outline:              "#877270",
  outlineVariant:       "#dac1be",
} as const;

export interface ShareCampaign {
  id: string;
  title: string;
  category: string;
  cover_image_url: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: ShareCampaign;
}

export default function ShareModal({ isOpen, onClose, campaign }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/explore?campaign_id=${campaign.id}&utm_medium=facebook&utm_source=share`;
  const caption = `I'm supporting "${campaign.title}" on Hopecard — a platform connecting donors with verified local causes. Every contribution counts 💙`;

  const copyToClipboard = useCallback(async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCopyLink = useCallback(
    () => copyToClipboard(shareUrl, setCopiedLink),
    [shareUrl, copyToClipboard]
  );
  const handleCopyCaption = useCallback(
    () => copyToClipboard(caption, setCopiedCaption),
    [caption, copyToClipboard]
  );
  const handleShareFacebook = useCallback(() => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(caption)}`;
    window.open(fbUrl, "_blank", "width=600,height=500,resizable=yes");
  }, [shareUrl, caption]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "rgba(28,21,21,0.4)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "52rem",
          background: C.surfaceContainerLowest,
          borderRadius: "1rem",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          overflow: "hidden",
          display: "flex",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        {/* Left: campaign image */}
        <div style={{ flex: "0 0 41.666%", minWidth: "240px", position: "relative", minHeight: "300px" }}>
          <img
            src={campaign.cover_image_url || "https://placehold.co/400x300?text=Campaign"}
            alt={campaign.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
            <span style={{
              background: "rgba(252,249,248,0.9)",
              backdropFilter: "blur(8px)",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.625rem",
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              fontFamily: "Manrope, sans-serif",
            }}>
              {campaign.category}
            </span>
          </div>
          <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem" }}>
            <h3 style={{ color: "#ffffff", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2, margin: 0 }}>
              {campaign.title}
            </h3>
          </div>
        </div>

        {/* Right: share form */}
        <div style={{ flex: 1, minWidth: "260px", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif", margin: "0 0 0.25rem" }}>
                Share This Campaign
              </h3>
              <p style={{ color: C.onSurfaceVariant, fontSize: "0.875rem", margin: 0 }}>
                Spread the word and help more people discover this cause.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.outline, display: "flex", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.onSurface)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.outline)}
            >
              <X size={22} />
            </button>
          </div>

          {/* Caption */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: C.onSurfaceVariant, marginBottom: "0.5rem", fontFamily: "Manrope, sans-serif" }}>
              Caption
            </label>
            <div style={{ background: C.surfaceContainerHigh, borderRadius: "0.75rem", padding: "1rem" }}>
              <p style={{ fontSize: "0.875rem", color: C.onSurface, lineHeight: 1.6, margin: "0 0 0.75rem", fontFamily: "Manrope, sans-serif" }}>
                {caption}
              </p>
              <button
                onClick={handleCopyCaption}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  background: "none", border: `1px solid ${C.outlineVariant}`,
                  borderRadius: "0.5rem", padding: "0.375rem 0.75rem",
                  cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                  color: copiedCaption ? C.primary : C.onSurfaceVariant,
                  fontFamily: "Manrope, sans-serif", transition: "color 0.15s",
                }}
              >
                {copiedCaption ? <Check size={14} /> : <Copy size={14} />}
                {copiedCaption ? "Copied!" : "Copy Caption"}
              </button>
            </div>
          </div>

          {/* Share link */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: C.onSurfaceVariant, marginBottom: "0.5rem", fontFamily: "Manrope, sans-serif" }}>
              Share Link
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{
                flex: 1, background: C.surfaceContainerHigh, borderRadius: "0.75rem",
                padding: "0.75rem 1rem", fontSize: "0.75rem", color: C.onSurfaceVariant,
                fontFamily: "Manrope, sans-serif", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
              }}>
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  background: copiedLink ? C.primaryContainer : C.surfaceContainerHigh,
                  border: "none", borderRadius: "0.75rem", padding: "0.75rem 1rem",
                  cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                  color: copiedLink ? C.onPrimaryContainer : C.onSurfaceVariant,
                  fontFamily: "Manrope, sans-serif", whiteSpace: "nowrap" as const,
                  transition: "background 0.2s, color 0.2s", flexShrink: 0,
                }}
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                {copiedLink ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          {/* Facebook CTA */}
          <button
            onClick={handleShareFacebook}
            style={{
              marginTop: "auto", width: "100%", background: "#1877F2", color: "#ffffff",
              padding: "1rem", borderRadius: "1rem", fontWeight: 700, fontSize: "1rem",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "0.75rem", fontFamily: "Manrope, sans-serif",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Share2 size={18} /> Share on Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `apps/frontend/`:
```bash
npx tsc --noEmit
```
Expected: no output (zero errors).

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/components/ShareModal.tsx
git commit -m "feat(share): add ShareModal component with copy-to-clipboard and Facebook Sharer"
```

---

## Task 2: Wire `ShareModal` into the Explore page

**Files:**
- Modify: `apps/frontend/app/explore/page.tsx`

- [ ] **Step 1: Add imports**

At the top of `apps/frontend/app/explore/page.tsx`, update the import block to add `Share2` from lucide-react and `ShareModal`/`ShareCampaign` from the new component.

Replace:
```tsx
import React, { useState } from "react";
import SharedLayout from "../../components/SharedLayout";
import DonationModal from "../../components/DonationModal";
import { useCampaigns } from "../../hooks/useCampaigns";
```

With:
```tsx
import React, { useState } from "react";
import SharedLayout from "../../components/SharedLayout";
import DonationModal from "../../components/DonationModal";
import ShareModal, { ShareCampaign } from "../../components/ShareModal";
import { Share2 } from "lucide-react";
import { useCampaigns } from "../../hooks/useCampaigns";
```

- [ ] **Step 2: Add share state inside `ExplorePage`**

Inside `export default function ExplorePage()`, after the existing `selectedCampaign` and `isModalOpen` state declarations, add:

```tsx
const [selectedShareCampaign, setSelectedShareCampaign] = useState<ShareCampaign | null>(null);
const [shareModalOpen, setShareModalOpen] = useState(false);

const handleShareClick = (campaign: ShareCampaign) => {
  setSelectedShareCampaign(campaign);
  setShareModalOpen(true);
};
```

- [ ] **Step 3: Add Share button to each campaign card**

Find the bottom action row of each campaign card — the `<div>` containing the raised amount and "Support" button (around line 168–192). Replace:

```tsx
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <span style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
    {`₱${c.collected_amount.toLocaleString()}`} <span style={{ fontSize: "0.875rem", fontWeight: 400, color: colors.onSurfaceVariant }}>raised</span>
  </span>
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleCampaignClick({ id: c.id, title: c.title, description: c.description, category: c.category, imageSrc: c.cover_image_url ?? '' });
    }}
    style={{
      background: "none",
      border: "none",
      color: colors.primary,
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontWeight: 700,
      fontSize: "0.875rem",
      cursor: "pointer",
      textDecoration: "underline",
      textDecorationColor: colors.primaryContainer,
      textUnderlineOffset: "4px",
    }}
  >
    Support
  </button>
</div>
```

With:
```tsx
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <span style={{ fontSize: "1.125rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
    {`₱${c.collected_amount.toLocaleString()}`} <span style={{ fontSize: "0.875rem", fontWeight: 400, color: colors.onSurfaceVariant }}>raised</span>
  </span>
  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleShareClick({ id: c.id, title: c.title, category: c.category, cover_image_url: c.cover_image_url ?? '' });
      }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: colors.onSurfaceVariant,
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        fontSize: "0.875rem",
        fontWeight: 600,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
      onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}
    >
      <Share2 size={15} />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleCampaignClick({ id: c.id, title: c.title, description: c.description, category: c.category, imageSrc: c.cover_image_url ?? '' });
      }}
      style={{
        background: "none",
        border: "none",
        color: colors.primary,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontWeight: 700,
        fontSize: "0.875rem",
        cursor: "pointer",
        textDecoration: "underline",
        textDecorationColor: colors.primaryContainer,
        textUnderlineOffset: "4px",
      }}
    >
      Support
    </button>
  </div>
</div>
```

- [ ] **Step 4: Add `ShareModal` at page root**

After the closing `</DonationModal>` tag (and before `</SharedLayout>`), add:

```tsx
{selectedShareCampaign && (
  <ShareModal
    isOpen={shareModalOpen}
    onClose={() => setShareModalOpen(false)}
    campaign={selectedShareCampaign}
  />
)}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/app/explore/page.tsx
git commit -m "feat(share): add share button to explore page campaign cards"
```

---

## Task 3: Wire `ShareModal` into the Home page

**Files:**
- Modify: `apps/frontend/app/home/page.tsx`

- [ ] **Step 1: Add imports**

In `apps/frontend/app/home/page.tsx`, after the existing imports, add:

```tsx
import ShareModal, { ShareCampaign } from "../../components/ShareModal";
import { Share2 } from "lucide-react";
```

- [ ] **Step 2: Add `onShare` to `CampaignCardProps`**

Find the `CampaignCardProps` interface (around line 29) and add `onShare`:

Replace:
```tsx
interface CampaignCardProps {
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  raised: string;
  progressPct: number;
}
```

With:
```tsx
interface CampaignCardProps {
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  raised: string;
  progressPct: number;
  onShare?: () => void;
}
```

- [ ] **Step 3: Add share button inside `CampaignCard`**

In the `CampaignCard` component, destructure `onShare` from props:

Replace:
```tsx
const CampaignCard = React.memo<CampaignCardProps>(
  ({ imageSrc, imageAlt, category, title, description, raised, progressPct }) => {
```

With:
```tsx
const CampaignCard = React.memo<CampaignCardProps>(
  ({ imageSrc, imageAlt, category, title, description, raised, progressPct, onShare }) => {
```

Then in the action row (the `<div>` containing the raised amount and "Support" link), replace:

```tsx
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <span
    style={{
      fontSize: "0.875rem",
      fontWeight: 700,
      fontFamily: "Plus Jakarta Sans, sans-serif",
    }}
  >
    {raised}{" "}
    <span style={{ color: "#a8a29e", fontWeight: 400 }}>raised</span>
  </span>
  <a
    href="#"
    style={{
      color: C.primary,
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontWeight: 700,
      fontSize: "0.875rem",
      textDecoration: "none",
      borderBottom: "2px solid transparent",
      transition: "border-color 0.15s",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.borderBottomColor = C.primary)
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.borderBottomColor = "transparent")
    }
  >
    Support
  </a>
</div>
```

With:
```tsx
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <span
    style={{
      fontSize: "0.875rem",
      fontWeight: 700,
      fontFamily: "Plus Jakarta Sans, sans-serif",
    }}
  >
    {raised}{" "}
    <span style={{ color: "#a8a29e", fontWeight: 400 }}>raised</span>
  </span>
  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
    {onShare && (
      <button
        onClick={(e) => { e.stopPropagation(); onShare(); }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#a8a29e", display: "flex", alignItems: "center",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#a8a29e")}
      >
        <Share2 size={15} />
      </button>
    )}
    <a
      href="#"
      style={{
        color: C.primary,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontWeight: 700,
        fontSize: "0.875rem",
        textDecoration: "none",
        borderBottom: "2px solid transparent",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderBottomColor = C.primary)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderBottomColor = "transparent")
      }
    >
      Support
    </a>
  </div>
</div>
```

- [ ] **Step 4: Add share state in `HomePage`**

Inside `export default function HomePage()`, after the existing `isModalOpen` state, add:

```tsx
const [selectedShareCampaign, setSelectedShareCampaign] = useState<ShareCampaign | null>(null);
const [shareModalOpen, setShareModalOpen] = useState(false);
```

- [ ] **Step 5: Pass `onShare` to each `CampaignCard` in the grid**

Find the `campaigns.map((c) => (...))` block in the Campaign Card Grid section. The current render is:

```tsx
<div key={c.id} onClick={() => handleCampaignClick({...})}>
  <CampaignCard
    imageSrc={c.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign'}
    imageAlt={c.title}
    category={c.category}
    title={c.title}
    description={c.description}
    raised={`₱${c.collected_amount.toLocaleString()}`}
    progressPct={c.progress_pct}
  />
</div>
```

Replace with:
```tsx
<div key={c.id} onClick={() => handleCampaignClick({
  id: c.id,
  imageSrc: c.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign',
  imageAlt: c.title,
  category: c.category,
  title: c.title,
  description: c.description,
  raised: `₱${c.collected_amount.toLocaleString()}`,
  progressPct: c.progress_pct,
})}>
  <CampaignCard
    imageSrc={c.cover_image_url ?? 'https://placehold.co/400x300?text=Campaign'}
    imageAlt={c.title}
    category={c.category}
    title={c.title}
    description={c.description}
    raised={`₱${c.collected_amount.toLocaleString()}`}
    progressPct={c.progress_pct}
    onShare={() => {
      setSelectedShareCampaign({ id: c.id, title: c.title, category: c.category, cover_image_url: c.cover_image_url ?? '' });
      setShareModalOpen(true);
    }}
  />
</div>
```

- [ ] **Step 6: Add `ShareModal` at page root**

Inside `return (...)`, after the closing `</DonationModal>` tag and before `</SharedLayout>`, add:

```tsx
{selectedShareCampaign && (
  <ShareModal
    isOpen={shareModalOpen}
    onClose={() => setShareModalOpen(false)}
    campaign={selectedShareCampaign}
  />
)}
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add apps/frontend/app/home/page.tsx
git commit -m "feat(share): add share button to home page campaign cards"
```

---

## Task 4: Wire `ShareModal` into the Success page

**Files:**
- Modify: `apps/frontend/app/payment/success/page.tsx`

- [ ] **Step 1: Add imports**

In `apps/frontend/app/payment/success/page.tsx`, add to the existing import block:

```tsx
import ShareModal from "../../../components/ShareModal";
```

- [ ] **Step 2: Add `useState` to the React import and replace `handleShare`**

First, update the React import at the top of the file. Replace:
```tsx
import React, { useCallback, useMemo } from "react";
```
With:
```tsx
import React, { useCallback, useMemo, useState } from "react";
```

Then, inside `export default function PaymentSuccessPage()`, after the `useCart` and `useProfile` destructuring, replace:
```tsx
const handleShare = useCallback(() => console.log("Share impact"), []);
```

With:
```tsx
const [shareModalOpen, setShareModalOpen] = useState(false);
const handleShare = useCallback(() => setShareModalOpen(true), []);
```

- [ ] **Step 3: Add `ShareModal` at page root**

Inside the `return (...)`, after the closing `</div>` of the main content wrapper (before `</SharedLayout>`), add:

```tsx
{cart.length > 0 && (
  <ShareModal
    isOpen={shareModalOpen}
    onClose={() => setShareModalOpen(false)}
    campaign={{
      id: cart[0].campaign_id,
      title: cart[0].title,
      category: cart[0].category ?? "Campaign",
      cover_image_url: cart[0].imageSrc,
    }}
  />
)}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/app/payment/success/page.tsx
git commit -m "feat(share): wire Share Your Impact button on success page"
```

---

## Manual Smoke Test

After all tasks:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd apps/frontend && npm run dev`
3. Log in → navigate to `/explore`
4. Hover a campaign card — share icon (↗) appears to the left of "Support"
5. Click share icon → `ShareModal` opens with campaign image, caption, link
6. Click "Copy Caption" → button shows "Copied!" for 2s, clipboard contains caption text
7. Click "Copy Link" → button shows "Copied!" for 2s, clipboard contains the URL
8. Click "Share on Facebook" → 600×500 popup opens to `facebook.com/sharer/sharer.php` with pre-filled URL
9. Close modal → repeat on `/home` page cards
10. Navigate to `/payment/success` → click "Share Your Impact" → modal opens with `cart[0]` campaign data
