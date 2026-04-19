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
