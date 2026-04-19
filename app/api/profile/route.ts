// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseRequest } from '../../../lib/hopecard-supabase';
import { getStorageUrl } from '../../../lib/storage-url';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface DbProfile {
  id: string;
  email: string;
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
    const email = req.nextUrl.searchParams.get('email');

    if (!authUserId || !UUID_RE.test(authUserId)) {
      return NextResponse.json({ error: 'Invalid authUserId' }, { status: 400 });
    }

    let rows = await supabaseRequest<DbProfile[]>(
      `digital_donor_profiles?auth_user_id=eq.${authUserId}&select=id,first_name,last_name,phone,address,barangay,municipality,province,profile_photo_key,status,created_at,total_donations_amount,total_donations_count&limit=1`
    );

    console.log(`[API /api/profile] DB query by authUserId returned ${rows.length} rows`);

    // Fallback: If not found by ID, search by email
    if (rows.length === 0 && email) {
      console.log(`[API /api/profile] Falling back to email search for: ${email}`);
      rows = await supabaseRequest<DbProfile[]>(
        `digital_donor_profiles?email=eq.${encodeURIComponent(email)}&select=id,first_name,last_name,phone,address,barangay,municipality,province,profile_photo_key,status,created_at,total_donations_amount,total_donations_count&limit=1`
      );
      console.log(`[API /api/profile] DB query by email returned ${rows.length} rows`);
    }

    if (rows.length === 0) {
      console.warn(`[API /api/profile] Profile not found for authUserId: ${authUserId} or email: ${email}`);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const row = rows[0];
    return NextResponse.json({
      profile: {
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone || '',
        address: row.address || '',
        barangay: row.barangay || '',
        municipality: row.municipality || '',
        province: row.province || '',
        profile_photo_url: row.profile_photo_key ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${row.profile_photo_key}` : null,
        profile_photo_key: row.profile_photo_key || '',
        status: row.status,
        created_at: row.created_at,
        total_donations_amount: row.total_donations_amount || 0,
        total_donations_count: row.total_donations_count || 0,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { 
      authUserId, first_name, last_name, phone, address, 
      barangay, municipality, province, profile_photo_key 
    } = await req.json();
    console.log(`[API /api/profile] PATCH request for authUserId: ${authUserId}`);
    
    if (!authUserId || !UUID_RE.test(authUserId)) {
      console.error(`[API /api/profile] Invalid authUserId in PATCH: ${authUserId}`);
      return NextResponse.json({ error: 'Invalid authUserId' }, { status: 400 });
    }

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
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
