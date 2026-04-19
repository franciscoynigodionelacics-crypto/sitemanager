-- Diagnostic script to verify digital_donor_profiles table setup
-- Run this in Supabase SQL Editor to identify the issue

-- 1. Check if table exists
SELECT 
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'digital_donor_profiles'
  ) as table_exists;

-- 2. List all columns in the table
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'digital_donor_profiles'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'digital_donor_profiles';

-- 4. List all RLS policies on the table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'digital_donor_profiles';

-- 5. Test insert (temporary - for diagnostics only)
-- This will help identify RLS or constraint issues
-- Uncomment and run to test:
/*
INSERT INTO digital_donor_profiles (
  auth_user_id,
  email,
  first_name,
  last_name,
  barangay,
  municipality,
  province,
  status,
  role
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test',
  'User',
  'Test Barangay',
  'Test Municipality',
  'Test Province',
  'pending',
  'buyer'
);
*/

-- 6. Check for constraints
SELECT 
  constraint_name,
  constraint_type,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'digital_donor_profiles';

-- 7. Check for unique constraints
SELECT 
  constraint_name,
  table_name,
  column_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'digital_donor_profiles';
