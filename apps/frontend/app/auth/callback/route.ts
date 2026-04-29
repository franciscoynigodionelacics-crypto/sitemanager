import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(new URL('/login?error=config', requestUrl.origin));
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin));
    }

    // Successful authentication - redirect to home
    return NextResponse.redirect(new URL('/home', requestUrl.origin));
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
