import { NextRequest, NextResponse } from 'next/server';
import { supabaseRequest } from '../../../lib/hopecard-supabase';
import { getStorageUrl } from '../../../lib/storage-url';

interface DbCampaign {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_amount: number;
  collected_amount: number;
  cover_image_key: string | null;
  status: string;
  end_date: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query = 'hc_campaigns?status=eq.active&select=id,title,description,category,target_amount,collected_amount,cover_image_key,status,end_date&order=created_at.desc';
    if (category) {
      query += `&category=eq.${encodeURIComponent(category)}`;
    }

    const rows = await supabaseRequest<DbCampaign[]>(query);

    const campaigns = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      category: row.category ?? 'other',
      target_amount: Number(row.target_amount),
      collected_amount: Number(row.collected_amount),
      progress_pct: row.target_amount > 0
        ? Math.round((Number(row.collected_amount) / Number(row.target_amount)) * 100)
        : 0,
      cover_image_url: getStorageUrl('campaigns', row.cover_image_key),
      status: row.status,
      end_date: row.end_date,
    }));

    return NextResponse.json({ campaigns });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch campaigns';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
