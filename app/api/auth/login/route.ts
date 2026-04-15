import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Authenticate with email/password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Step 2: Check donor approval status
    // Use service role to query the digital_donor_profiles table
    const adminKey = supabaseServiceKey || supabaseKey;
    const supabaseAdmin = createClient(supabaseUrl, adminKey);

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('digital_donor_profiles')
      .select('status')
      .eq('auth_user_id', data.user?.id)
      .single();

    if (profileError) {
      console.error('Error fetching donor profile:', profileError);
      // If profile doesn't exist, deny login
      return NextResponse.json(
        { error: 'Donor profile not found. Please complete the signup process.' },
        { status: 403 }
      );
    }

    // Step 3: Check if status is 'approved'
    if (profileData?.status !== 'approved') {
      return NextResponse.json(
        {
          error: 'Your account is not yet approved',
          reason: 'pending_approval',
          status: profileData?.status || 'unknown',
        },
        { status: 403 }
      );
    }

    // Step 4: User is approved - allow login
    return NextResponse.json({ success: true, user: data.user }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
