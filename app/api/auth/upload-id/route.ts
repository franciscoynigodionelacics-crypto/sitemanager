import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must not exceed 5MB' },
        { status: 400 }
      );
    }

    // Use service role if available, otherwise use anon key
    const key = supabaseServiceKey || supabaseAnonKey;
    const supabase = createClient(supabaseUrl, key!);

    try {
      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const filename = `${userId}/${timestamp}-valid-id.${ext}`;

      // Upload file to storage bucket
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`Attempting to upload file: ${filename} to bucket: donor-ids`);

      const { data, error } = await supabase.storage
        .from('donor-ids')
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error('Storage upload error:', error);

        // Check if it's a bucket not found error
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          return NextResponse.json(
            {
              success: false,
              warning: 'Storage bucket not configured. Please create "donor-ids" bucket in Supabase Storage.',
              error: error.message,
            },
            { status: 503 }
          );
        }

        return NextResponse.json(
          { error: `Failed to upload file: ${error.message}` },
          { status: 400 }
        );
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('donor-ids').getPublicUrl(filename);

      console.log(`File uploaded successfully: ${publicUrl}`);

      // Return the storage path/key (not the public URL)
      return NextResponse.json(
        {
          success: true,
          path: data.path,  // Storage bucket path/key (e.g., "userId/timestamp-valid-id.jpg")
          url: publicUrl,   // Public URL (for reference)
          message: 'ID uploaded successfully',
        },
        { status: 200 }
      );
    } catch (storageError) {
      const message = storageError instanceof Error ? storageError.message : 'Storage error';
      console.error('Storage operation error:', message);
      return NextResponse.json(
        {
          success: false,
          warning: 'Could not upload file to storage',
          error: message,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('Upload error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
