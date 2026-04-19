-- Setup script for digital_donor_profiles table
-- Run this in your Supabase SQL Editor at: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

-- Drop existing table if needed (CAUTION: This will delete data)
-- DROP TABLE IF EXISTS digital_donor_profiles CASCADE;

-- Create the digital_donor_profiles table
CREATE TABLE IF NOT EXISTS digital_donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  barangay VARCHAR(255),
  municipality VARCHAR(255),
  province VARCHAR(255),
  id_verification_key TEXT,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  role VARCHAR(50) DEFAULT 'buyer' NOT NULL CHECK (role = 'buyer'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_digital_donor_profiles_auth_user_id 
  ON digital_donor_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_digital_donor_profiles_email 
  ON digital_donor_profiles(email);
CREATE INDEX IF NOT EXISTS idx_digital_donor_profiles_status 
  ON digital_donor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_digital_donor_profiles_created_at 
  ON digital_donor_profiles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE digital_donor_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON digital_donor_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON digital_donor_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON digital_donor_profiles;
DROP POLICY IF EXISTS "Service role can access all profiles" ON digital_donor_profiles;

-- Create RLS policies
-- 1. Users can view their own profile
CREATE POLICY "Users can view their own profile" ON digital_donor_profiles
  FOR SELECT 
  USING (auth.uid() = auth_user_id);

-- 2. Users can insert their own profile
CREATE POLICY "Users can create their own profile" ON digital_donor_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = auth_user_id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update their own profile" ON digital_donor_profiles
  FOR UPDATE 
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- 4. Service role can access and manage all profiles
CREATE POLICY "Service role can access all profiles" ON digital_donor_profiles
  USING (auth.role() = 'service_role');

-- Create the donor-ids storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'donor-ids',
  'donor-ids',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own ID" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own ID" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage all IDs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view donor IDs" ON storage.objects;

-- Create storage RLS policies
-- 1. Users can upload their own IDs
CREATE POLICY "Users can upload their own ID" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'donor-ids' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. Users can view their own IDs
CREATE POLICY "Users can view their own ID" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'donor-ids' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Service role can manage all IDs
CREATE POLICY "Service role can manage all IDs" ON storage.objects
  USING (bucket_id = 'donor-ids' AND auth.role() = 'service_role');

-- 4. Public can view (read) IDs (needed for public URLs)
CREATE POLICY "Public can view donor IDs" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'donor-ids');

-- Verify the setup
SELECT 
  'Table' as object,
  'digital_donor_profiles' as name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'digital_donor_profiles'
  ) as exists;

SELECT 
  'Bucket' as object,
  'donor-ids' as name,
  EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE name = 'donor-ids'
  ) as exists;

-- Check table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'digital_donor_profiles'
ORDER BY ordinal_position;

-- Count RLS policies on table
SELECT COUNT(*) as rls_policies_count
FROM pg_policies
WHERE tablename = 'digital_donor_profiles';

-- Count storage policies on bucket
SELECT COUNT(*) as storage_policies_count
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
