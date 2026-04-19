// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseRequest } from '../../../lib/hopecard-supabase';
import { getStorageUrl } from '../../../lib/storage-url';

interface DbProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  barangay: string | null;
  municipality: string | null;
  province: string | null;
  profile_photo_key: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const authUserId = req.nextUrl.searchParams.get('authUserId');
    if (!authUserId) return NextResponse.json({ error: 'authUserId required' }, { status: 400 });

    const rows = await supabaseRequest<DbProfile[]>(
      `digital_donor_profiles?auth_user_id=eq.${authUserId}&select=id,first_name,last_name,phone,address,barangay,municipality,province,profile_photo_key&limit=1`
    );

    if (rows.length === 0) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const row = rows[0];
    return NextResponse.json({
      profile: {
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone ?? '',
        address: row.address ?? '',
        barangay: row.barangay ?? '',
        municipality: row.municipality ?? '',
        province: row.province ?? '',
        profile_photo_url: getStorageUrl('profiles', row.profile_photo_key),
        profile_photo_key: row.profile_photo_key ?? '',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { authUserId, phone, address, barangay, municipality, province, profile_photo_key } = await req.json();
    if (!authUserId) return NextResponse.json({ error: 'authUserId required' }, { status: 400 });

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (barangay !== undefined) updates.barangay = barangay;
    if (municipality !== undefined) updates.municipality = municipality;
    if (province !== undefined) updates.province = province;
    if (profile_photo_key !== undefined) updates.profile_photo_key = profile_photo_key;

    await supabaseRequest(
      `digital_donor_profiles?auth_user_id=eq.${authUserId}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(updates),
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
