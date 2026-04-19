import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      barangay,
      municipality,
      province,
      validIdUrl,
    } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName, lastName' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    // Create auth client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the origin from the request
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Step 1: Create the auth user with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user?.id) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 400 }
      );
    }

    // Step 2: Create the donor profile using service role
    const profileData = {
      auth_user_id: authData.user.id,
      email: email, // Store email in the profile table
      first_name: firstName,
      last_name: lastName,
      barangay: barangay || null,
      municipality: municipality || null,
      province: province || null,
      id_verification_key: validIdUrl || null,
      status: 'pending', // Required: must be lowercase 'pending', 'approved', or 'rejected'
      role: 'buyer', // Required: must be 'buyer' per CHECK constraint
    };

    console.log(`Attempting to create profile for: ${email} (${authData.user.id})`);

    let profileCreated = false;
    let profileError = null;

    if (!supabaseServiceKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Profile creation may fail due to RLS.');
    }

    const adminKey = supabaseServiceKey || supabaseKey;
    const supabaseAdmin = createClient(supabaseUrl, adminKey);

    // Check if a profile already exists for this email (to avoid unique constraint violations)
    const { data: existingProfile } = await supabaseAdmin
      .from('digital_donor_profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      console.log('Profile already exists for this email. Updating instead of inserting.');
      const updateResult = await supabaseAdmin
        .from('digital_donor_profiles')
        .update(profileData)
        .eq('email', email);
      
      if (updateResult.error) {
        profileError = updateResult.error;
      } else {
        profileCreated = true;
      }
    } else {
      const insertResult = await supabaseAdmin
        .from('digital_donor_profiles')
        .insert(profileData);

      if (insertResult.error) {
        profileError = insertResult.error;
      } else {
        profileCreated = true;
      }
    }

    // Return appropriate response based on profile creation
    if (!profileCreated) {
      const errorMsg = profileError?.message || 'Unknown error';
      const errorCode = profileError?.code || 'NO_CODE';
      console.error(`Profile creation failed. Error: ${errorMsg} (${errorCode})`);

      // If profile creation failed, it's a major issue. 
      // We still return 200 because the Auth user was created, 
      // but we MUST provide the error so the frontend can show it.
      return NextResponse.json(
        {
          success: true, // Auth user exists
          user: authData.user,
          profileCreated: false,
          error: `Account created, but profile setup failed: ${errorMsg}. Please contact support with code ${errorCode}.`,
          warning: 'Profile creation failed.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: authData.user,
        profileCreated: true,
        message: 'Donor profile created successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signup route error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
