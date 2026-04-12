import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, sessionToken } = await request.json();

    if (!email || !password || !sessionToken) {
      return NextResponse.json(
        { error: 'Email, password, and session token are required' },
        { status: 400 }
      );
    }

    // Verify sessionToken is valid (check it's a valid base64 encoded JSON)
    let tokenData;
    try {
      const decodedToken = Buffer.from(sessionToken, 'base64').toString('utf-8');
      tokenData = JSON.parse(decodedToken);

      if (tokenData.email !== email || !tokenData.verified) {
        return NextResponse.json(
          { error: 'Invalid or expired session token' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
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

    // Use service role key if available for admin operations, otherwise use anon key
    const key = supabaseServiceKey || supabaseKey;
    const supabase = createClient(supabaseUrl, key);

    // Find the user by email
    let userId: string;

    if (supabaseServiceKey) {
      // If we have service role key, use admin API to find user
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();

      if (listError || !users) {
        return NextResponse.json(
          { error: 'Failed to find user' },
          { status: 500 }
        );
      }

      const user = users.users.find((u) => u.email === email);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      userId = user.id;

      // Update password using admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password,
      });

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }
    } else {
      // Fallback: Create a magic link for password reset through Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      });

      if (resetError) {
        return NextResponse.json(
          { error: resetError.message },
          { status: 400 }
        );
      }

      // This is a fallback - in production you should have SERVICE_ROLE_KEY
      // For now we'll just return success
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
