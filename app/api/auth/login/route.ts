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
    const userId = data.user?.id;
    const userEmail = data.user?.email || email;

    console.log(`Checking profile for user: ${userId} (${userEmail})`);

    let { data: profileData, error: profileError } = await supabaseAdmin
      .from('digital_donor_profiles')
      .select('status, role')
      .eq('auth_user_id', userId)
      .single();

    // Fallback 1: If not found by ID, try looking up by email
    // This handles cases where the auth_user_id link might be missing or broken
    if (profileError || !profileData) {
      console.log('Profile not found by ID, attempting lookup by email...');
      const { data: emailProfile, error: emailError } = await supabaseAdmin
        .from('digital_donor_profiles')
        .select('status, role, auth_user_id')
        .eq('email', userEmail)
        .single();

      if (!emailError && emailProfile) {
        console.log('Profile found by email lookup. Syncing auth_user_id...');
        profileData = emailProfile;
        profileError = null;
        
        // Sync the auth_user_id if it's missing or different
        const { error: syncError } = await supabaseAdmin
          .from('digital_donor_profiles')
          .update({ auth_user_id: userId })
          .eq('email', userEmail);
          
        if (syncError) {
          console.warn('Failed to sync auth_user_id for profile:', syncError.message);
        } else {
          console.log('auth_user_id successfully synced for email:', userEmail);
        }
      }
    }

    // Fallback 2: Check the general 'profiles' table (for staff/admins or legacy users)
    if (profileError || !profileData) {
      console.log('Profile not found in digital_donor_profiles, checking legacy profiles table...');
      const { data: legacyProfile, error: legacyError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!legacyError && legacyProfile) {
        console.log('User found in legacy profiles table. Role:', legacyProfile.role);
        // If they are in the legacy table, we might want to let them in or give a specific error
        return NextResponse.json(
          { 
            success: true, 
            user: data.user, 
            isLegacyUser: true,
            role: legacyProfile.role 
          }, 
          { status: 200 }
        );
      }
    }

    if (profileError || !profileData) {
      console.error('Final profile fetch error:', profileError);
      return NextResponse.json(
        { 
          error: 'Donor profile not found. Please ensure you have completed the signup process or contact support.',
          details: profileError?.message,
          code: profileError?.code
        },
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
    return NextResponse.json({ success: true, user: data.user, session: data.session }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
