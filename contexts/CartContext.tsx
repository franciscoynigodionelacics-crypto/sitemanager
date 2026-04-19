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
  processingFee: number;
  apiTotal: number;
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
  const [processingFee, setProcessingFee] = useState(0);
  const [apiTotal, setApiTotal] = useState(0);

  const applyCartResponse = useCallback((data: ApiCartResponse) => {
    setCart(data.cart.items.map(toCartItem));
    setProcessingFee(data.cart.processing_fee);
    setApiTotal(data.cart.total);
  }, []);

  // Load cart from DB on mount
  useEffect(() => {
    async function loadCart() {
      try {
        const user = await getCurrentUser();
        if (!user) { setLoading(false); return; }
        setAuthUserId(user.id);
        const res = await fetch(`/api/cart?authUserId=${user.id}`);
        const data: ApiCartResponse = await res.json();
        if (res.ok) applyCartResponse(data);
      } catch {
        // silently fail — cart stays empty
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [applyCartResponse]);

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
    const data = await res.json();
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to add to cart');
    applyCartResponse(data);
  }, [authUserId, applyCartResponse]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!authUserId) return;
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authUserId, cart_item_id: cartItemId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to remove from cart');
    applyCartResponse(data);
  }, [authUserId, applyCartResponse]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!authUserId) return;
    const res = await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authUserId, cart_item_id: cartItemId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to update cart');
    applyCartResponse(data);
  }, [authUserId, applyCartResponse]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, loading, processingFee, apiTotal,
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
