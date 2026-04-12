import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Helper to generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configure email transporter using environment variables
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Generate OTP code
    const otpCode = generateOTP();
    const now = Date.now();
    const expiresAtMs = now + 10 * 60 * 1000; // 10 minutes expiry in milliseconds

    // Store OTP in Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete any previous unused OTP for this email
    await supabase
      .from('otp_sessions')
      .delete()
      .eq('email', email)
      .eq('used', false);

    // Insert new OTP
    const { error: insertError } = await supabase
      .from('otp_sessions')
      .insert({
        email,
        otp: otpCode,
        created_at_ms: now,
        expires_at_ms: expiresAtMs,
        used: false,
      });

    if (insertError) {
      console.error('Failed to store OTP:', insertError);
      // Continue anyway and try to send email
    }

    // Send OTP via email
    try {
      const transporter = createEmailTransporter();

      const senderName = process.env.SMTP_FROM || 'Hopecard';
      const senderEmail = process.env.SMTP_USER;
      const fromAddress = `${senderName} <${senderEmail}>`;

      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: 'Your OTP Code - Hopecard',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6A1B1B;">Password Reset Request</h2>
            <p>Your OTP code is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #6A1B1B; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'OTP sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('OTP generation error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
