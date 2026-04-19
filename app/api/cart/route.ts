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
