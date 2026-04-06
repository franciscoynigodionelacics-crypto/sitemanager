import { NextRequest, NextResponse } from 'next/server';
import {
  findHopecardRecordByTitle,
  getRecordId,
  getRecordTitle,
  supabaseRequest,
} from '../../../lib/hopecard-supabase';

type CheckoutItemInput = {
  cardId: string;
  title: string;
  amount: number;
  quantity: number;
};

type PurchasePayload = {
  buyerAuthId: string;
  paymentMethod: string;
  checkoutItems: CheckoutItemInput[];
};

type PurchaseRow = {
  id: string;
  buyer_auth_id: string;
  hopecard_id: string;
  amount_paid: number;
  payment_method: string;
  payment_reference: string;
  status: string;
  purchased_at: string;
};

type HopecardRecord = Record<string, unknown>;

const PAYMENT_METHOD_MAP: Record<string, string> = {
  gcash: 'gcash',
  paymaya: 'maya',
  'credit card': 'card',
};

function normalizePaymentMethod(paymentMethod: string): string {
  return PAYMENT_METHOD_MAP[paymentMethod.trim().toLowerCase()] ?? paymentMethod.trim().toLowerCase();
}

function buildPaymentReference(paymentMethod: string, index: number): string {
  const prefix = paymentMethod.slice(0, 3).toUpperCase();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `${prefix}-HC-${datePart}-${index + 1}-${suffix}`;
}

async function fetchHopecards(): Promise<HopecardRecord[]> {
  const tables = ['hc_campaigns', 'hopecards'];
  const results = await Promise.allSettled(
    tables.map((table) => supabaseRequest<HopecardRecord[]>(`${table}?select=*`)),
  );

  const records: HopecardRecord[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      records.push(...result.value);
    }
  });

  if (records.length === 0) {
    throw new Error('No campaign source rows were found in hc_campaigns or hopecards.');
  }

  return records;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PurchasePayload;
    const buyerAuthId = body.buyerAuthId?.trim();
    const paymentMethod = normalizePaymentMethod(body.paymentMethod ?? '');
    const checkoutItems = Array.isArray(body.checkoutItems) ? body.checkoutItems : [];

    if (!buyerAuthId) {
      return NextResponse.json({ error: 'buyerAuthId is required.' }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'paymentMethod is required.' }, { status: 400 });
    }

    if (checkoutItems.length === 0) {
      return NextResponse.json({ error: 'At least one checkout item is required.' }, { status: 400 });
    }

    const hopecards = await fetchHopecards();

    const purchasesToInsert = checkoutItems.map((item, index) => {
      const hopecard = findHopecardRecordByTitle(hopecards, item.title);
      const hopecardId = hopecard ? getRecordId(hopecard) : null;

      if (!hopecardId) {
        throw new Error(`No campaign row matched "${item.title}". Make sure the title in hc_campaigns or hopecards matches the UI card.`);
      }

      return {
        buyer_auth_id: buyerAuthId,
        hopecard_id: hopecardId,
        amount_paid: item.amount * item.quantity,
        payment_method: paymentMethod,
        payment_reference: buildPaymentReference(paymentMethod, index),
        status: 'paid',
        purchased_at: new Date().toISOString(),
      };
    });

    const insertedRows = await supabaseRequest<PurchaseRow[]>(
      'hopecard_purchases',
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(purchasesToInsert),
      },
    );

    return NextResponse.json({ purchases: insertedRows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create purchase records.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const buyerAuthId = request.nextUrl.searchParams.get('buyerAuthId')?.trim();
    if (!buyerAuthId) {
      return NextResponse.json({ error: 'buyerAuthId is required.' }, { status: 400 });
    }

    const purchases = await supabaseRequest<PurchaseRow[]>(
      `hopecard_purchases?select=*&buyer_auth_id=eq.${encodeURIComponent(buyerAuthId)}&order=purchased_at.desc`,
    );
    const hopecards = await fetchHopecards();
    const titleById = new Map<string, string>();

    hopecards.forEach((record) => {
      const id = getRecordId(record);
      const title = getRecordTitle(record);
      if (id && title) {
        titleById.set(id, title);
      }
    });

    const transactions = purchases.map((purchase) => ({
      id: purchase.id,
      title: titleById.get(purchase.hopecard_id) ?? purchase.hopecard_id,
      amount: purchase.amount_paid,
      method: purchase.payment_method,
      status: purchase.status,
      paymentReference: purchase.payment_reference,
      purchasedAt: purchase.purchased_at,
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load purchases.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
