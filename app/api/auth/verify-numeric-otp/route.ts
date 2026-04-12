import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the OTP record
    const { data, error: fetchError } = await supabase
      .from('otp_sessions')
      .select('*')
      .eq('email', email)
      .eq('used', false)
      .single();

    if (fetchError || !data) {
      return NextResponse.json(
        { error: 'No active OTP request found for this email' },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    const now = Date.now();

    if (now > data.expires_at_ms) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Verify OTP code
    if (data.otp !== code) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await supabase
      .from('otp_sessions')
      .update({ used: true })
      .eq('id', data.id);

    // Create a temporary session token (JWT-like)
    // In production, you'd use proper JWT signing
    const sessionToken = Buffer.from(
      JSON.stringify({
        email,
        verified: true,
        timestamp: Date.now(),
      })
    ).toString('base64');

    return NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully',
        sessionToken,
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
