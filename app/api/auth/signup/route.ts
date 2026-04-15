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
      first_name: firstName,
      last_name: lastName,
      barangay: barangay || null,
      municipality: municipality || null,
      province: province || null,
      id_verification_key: validIdUrl || null,
      status: 'pending', // Required: must be lowercase 'pending', 'approved', or 'rejected'
      role: 'buyer', // Required: must be 'buyer' per CHECK constraint
    };

    let profileCreated = false;
    let profileError = null;

    if (supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const insertResult = await supabaseAdmin
        .from('digital_donor_profiles')
        .insert(profileData);

      if (insertResult.error) {
        profileError = insertResult.error;
        console.error('Failed to create donor profile with service role:', profileError);
      } else {
        profileCreated = true;
      }
    } else {
      // Fallback: try to create profile with anon key (requires RLS policies)
      const insertResult = await supabase
        .from('digital_donor_profiles')
        .insert(profileData);

      if (insertResult.error) {
        profileError = insertResult.error;
        console.error('Failed to create donor profile with anon key:', profileError);
      } else {
        profileCreated = true;
      }
    }

    // Return appropriate response based on profile creation
    if (!profileCreated) {
      const errorMsg = profileError?.message || 'Unknown error';
      const errorDetails = JSON.stringify(profileError);
      console.error(
        `Profile creation failed but user was created. Error: ${errorMsg}. Full error: ${errorDetails}`
      );

      // Return 200 but with warning so frontend knows to alert user
      return NextResponse.json(
        {
          success: true,
          user: authData.user,
          profileCreated: false,
          warning: `Profile creation failed: ${errorMsg}. Please contact support.`,
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
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
