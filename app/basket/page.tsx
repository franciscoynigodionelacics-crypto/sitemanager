"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SharedLayout from "../../components/SharedLayout";
import { Trash2, Plus, Minus } from "lucide-react";

// Design Tokens
const colors = {
  primary: "#97453e",
  primaryContainer: "#f28d83",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#6e2621",
  secondary: "#a8372c",
  surface: "#fcf9f8",
  surfaceContainer: "#f0edec",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#1b1c1b",
  onSurfaceVariant: "#554240",
  outline: "#877270",
  outlineVariant: "#dac1be",
} as const;

interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  imageSrc: string;
  imageAlt: string;
}

const INITIAL_CART: CartItem[] = [
  {
    id: "cart-1",
    title: "Rural Education Fund",
    price: 5000,
    currency: "₱",
    quantity: 1,
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJoWOlOlxYpNJZ9dR_ul5wJm5AjUXUsPB_TCFU4Gddj3fbyY0_wvu1q0iMHog502i2-vymILbq8lcQtlDSBIYqedJYPMCr66CdSHpG_W27SJPGPwRPxvxgxWKX8cOuLWb_RCxl59cE3tV6Dh-CSNy74PrLcc_H2OgR-QeKLM8YA6C6wqUmEkwu-eiU6sfOEv-qh3pHvmD5G8eWu7XqrMppKR5Vk2D9TC17qcdaB3yL10Eh74Uifk1rnJPMZpAzYUoiX5xpm42CSQky",
    imageAlt: "A bright sunlit classroom in a rural village with children smiling and learning",
  },
  {
    id: "cart-2",
    title: "Reforestation Project",
    price: 2500,
    currency: "₱",
    quantity: 2,
    imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiGQ96Y9Wbv-BjDlr9nTG3ecz-x3ByOvcd31etGIOUqHJ4rbgfYnXHgslhOlKl5S7IUZYgGnM9mTfO4ddQ324x-0dUSDYg0BnEEDsmu1sGRKGJqFPRHfOYDo1ZCmhNMex_VAz7biMlzwN8HsqYry8ct-kV6pUsdQgjAMFOX0j2h4jj6dzFe4KKqgbIOyA1NFJXs5R-RBRIxvKp8T4CyIo1DmfTEaNgBiWhlSOV0yZjaw7zglbwFniHCHHLtHIrKHu8TpgzboJxxska",
    imageAlt: "Close-up of hands gently planting a small green sapling into rich dark soil",
  },
];

const TRAIN_LAW = { used: 15000, limit: 250000 };

export default function BasketPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);

  const handleRemove = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleQuantityChange = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const trainUsedPercent = Math.round((TRAIN_LAW.used / TRAIN_LAW.limit) * 100);

  return (
    <SharedLayout currentPage="basket">
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "2rem 3rem" }}>
        {/* Header */}
        <header style={{ marginBottom: "3rem", maxWidth: "800px" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: colors.primary, marginBottom: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
            Your Selection
          </h1>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, fontFamily: "Plus Jakarta Sans, sans-serif", fontStyle: "italic", opacity: 0.9, margin: "0 0 0.5rem" }}>
            Impact Basket
          </h2>
          <p style={{ color: colors.onSurfaceVariant, fontSize: "1.125rem", lineHeight: 1.6, margin: 0 }}>
            Every contribution is a seed of hope. Review your choices and see the ripple effect of your generosity.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem" }}>
          {/* Cart Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {cart.map((item) => (
              <div key={item.id} style={{ background: colors.surfaceContainerLowest, borderRadius: "1rem", padding: "2rem", display: "flex", gap: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "box-shadow 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(151,69,62,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)")}>
                <div style={{ width: "16rem", height: "12rem", borderRadius: "0.75rem", overflow: "hidden", flexShrink: 0 }}>
                  <img src={item.imageSrc} alt={item.imageAlt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: colors.onSurface, marginBottom: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{item.title}</h3>
                      <p style={{ color: colors.primary, fontWeight: 700, fontSize: "1.25rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {item.currency}{item.price.toLocaleString()}
                      </p>
                    </div>
                    <button onClick={() => handleRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.onSurfaceVariant, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.secondary)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}>
                      <Trash2 size={18} /> Remove
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", background: colors.surfaceContainerLow, borderRadius: "999px", padding: "0.25rem", border: `1px solid ${colors.outlineVariant}` }}>
                      <button onClick={() => handleQuantityChange(item.id, -1)} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", transition: "background 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceContainer)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <Minus size={18} />
                      </button>
                      <span style={{ width: "3rem", textAlign: "center", fontWeight: 700, fontSize: "1.125rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {String(item.quantity).padStart(2, "0")}
                      </span>
                      <button onClick={() => handleQuantityChange(item.id, 1)} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: colors.primary, transition: "background 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceContainer)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <Plus size={18} />
                      </button>
                    </div>
                    <span style={{ color: colors.onSurfaceVariant, fontSize: "0.875rem" }}>Units of Impact</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* TRAIN Law Credit */}
            <div style={{ background: colors.surfaceContainerLow, borderRadius: "1rem", padding: "2rem", border: `1px solid ${colors.outlineVariant}33` }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.125rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🏛️</span> TRAIN Law Credit
              </h3>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                  <span style={{ color: colors.onSurfaceVariant }}>Annual Limit Status</span>
                  <span style={{ fontWeight: 700, color: colors.onSurface }}>₱{TRAIN_LAW.limit.toLocaleString()} Limit</span>
                </div>
                <div style={{ height: "0.75rem", width: "100%", background: colors.surfaceContainer, borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${trainUsedPercent}%`, background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryContainer})`, transition: "width 1s" }} />
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 500, color: colors.onSurfaceVariant, marginTop: "0.75rem" }}>
                  <span style={{ color: colors.primary, fontWeight: 700 }}>₱{TRAIN_LAW.used.toLocaleString()}</span> of ₱{TRAIN_LAW.limit.toLocaleString()} USED
                </p>
              </div>
            </div>

            {/* Impact Summary */}
            <div style={{ background: colors.surfaceContainerLowest, borderRadius: "1rem", padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.5rem", marginBottom: "2rem" }}>Impact Summary</h3>
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: colors.onSurfaceVariant }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: colors.onSurface }}>₱{subtotal.toLocaleString()}.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: colors.onSurfaceVariant }}>
                  <span>Processing Fee</span>
                  <span style={{ color: colors.secondary, fontWeight: 500, fontStyle: "italic" }}>₱0.00</span>
                </div>
                <div style={{ paddingTop: "1rem", borderTop: `1px solid ${colors.outlineVariant}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: "2rem", color: colors.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>₱{subtotal.toLocaleString()}.00</span>
                </div>
              </div>
              <button onClick={() => router.push('/payment')} style={{ width: "100%", background: colors.primaryContainer, color: colors.onPrimaryContainer, padding: "1.25rem", borderRadius: "1rem", fontWeight: 700, fontSize: "1.125rem", border: "none", cursor: "pointer", boxShadow: `0 8px 20px ${colors.primaryContainer}33`, transition: "transform 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                Complete Donation ❤️
              </button>
              <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: colors.onSurfaceVariant, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", opacity: 0.6 }}>
                <span>🔒</span> Secure Philanthropic Transfer
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: "0.875rem", color: colors.onSurfaceVariant, lineHeight: 1.6, padding: "0 1rem" }}>
              Your contribution is tax-deductible under Philippine Law. A digital BIR receipt will be sent to your registered email immediately.
            </p>
          </aside>
        </div>
      </div>
    </SharedLayout>
  );
}
