# Backend Integration Guide - Donor Profile System

## Overview

This guide documents the backend functionality that has been merged from the hopecard-backend-integration project into the main sitemanager project. The integration adds a complete donor profile management system with approval workflow.

## What Was Merged

### 1. API Routes

#### `/api/auth/signup` (Enhanced)
- **Purpose**: Creates user account and donor profile
- **Features**:
  - Creates Supabase Auth user
  - Creates donor profile in `digital_donor_profiles` table
  - Handles file upload reference (ID verification)
  - Sets default status to 'pending'
  - Validates required fields (firstName, lastName, email, password)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "barangay": "Barangay Name",
  "municipality": "Municipality Name",
  "province": "Province Name",
  "validIdUrl": "storage/path/to/id.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "user": { /* Supabase user object */ },
  "profileCreated": true,
  "message": "Donor profile created successfully"
}
```

#### `/api/auth/login` (Enhanced)
- **Purpose**: Authenticates user and checks approval status
- **Features**:
  - Validates email/password with Supabase Auth
  - Checks donor profile approval status
  - Only allows login if status is 'approved'
  - Returns specific error messages for pending/rejected accounts

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "user": { /* Supabase user object */ }
}
```

**Response (Pending Approval)**:
```json
{
  "error": "Your account is not yet approved",
  "reason": "pending_approval",
  "status": "pending"
}
```

#### `/api/auth/upload-id` (New)
- **Purpose**: Handles file uploads for ID verification
- **Features**:
  - Validates file type (JPG, PNG, PDF)
  - Validates file size (max 5MB)
  - Uploads to Supabase Storage bucket 'donor-ids'
  - Returns storage path/key for database reference

**Request**: FormData with:
- `file`: File object
- `userId`: User identifier for storage path

**Response**:
```json
{
  "success": true,
  "path": "userId/timestamp-valid-id.jpg",
  "url": "https://...public-url...",
  "message": "ID uploaded successfully"
}
```

### 2. Frontend Pages

#### `/signup` (Updated)
- Collects comprehensive donor information:
  - First Name, Last Name
  - Email, Password
  - Barangay, Municipality, Province
  - Valid ID file upload
- Uploads ID file before account creation
- Redirects to `/check-email` after successful signup

#### `/login` (Updated)
- Handles approval status messages
- Shows specific error for pending accounts
- Shows specific error for rejected accounts
- Redirects to `/home` after successful login

#### `/check-email` (New)
- Confirmation page after signup
- Explains next steps for email verification
- Informs user about approval process

### 3. Database Schema

#### Table: `digital_donor_profiles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `auth_user_id` | UUID | Foreign key to auth.users |
| `first_name` | VARCHAR(255) | Required |
| `last_name` | VARCHAR(255) | Required |
| `barangay` | VARCHAR(255) | Optional location field |
| `municipality` | VARCHAR(255) | Optional location field |
| `province` | VARCHAR(255) | Optional location field |
| `id_verification_key` | TEXT | Storage path to uploaded ID |
| `status` | VARCHAR(50) | 'pending', 'approved', or 'rejected' |
| `role` | VARCHAR(50) | Must be 'buyer' |
| `created_at` | TIMESTAMP | Auto-set on creation |
| `updated_at` | TIMESTAMP | Auto-set on update |

**Constraints**:
- `status` must be one of: 'pending', 'approved', 'rejected'
- `role` must be 'buyer'
- `auth_user_id` is unique and cascades on delete

**Indexes**:
- `auth_user_id` (for fast user lookups)
- `status` (for filtering by approval status)
- `created_at` (for sorting by registration date)

#### Storage Bucket: `donor-ids`
- **Purpose**: Stores uploaded ID verification files
- **Settings**:
  - Public: Yes (for public URL access)
  - Max file size: 5MB
  - Allowed types: JPG, PNG, PDF
- **Structure**: `{userId}/{timestamp}-valid-id.{ext}`

### 4. Row Level Security (RLS)

#### Table Policies:
1. **Users can view their own profile**: Users can SELECT their own records
2. **Users can create their own profile**: Users can INSERT their own records
3. **Users can update their own profile**: Users can UPDATE their own records
4. **Service role can access all profiles**: Admin access for approval workflow

#### Storage Policies:
1. **Users can upload their own ID**: Users can INSERT to their folder
2. **Users can view their own ID**: Users can SELECT from their folder
3. **Service role can manage all IDs**: Admin access to all files
4. **Public can view donor IDs**: Public SELECT access for URLs

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and keys

### 2. Database Setup

Run the SQL script in Supabase SQL Editor:

```bash
# Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
# Copy and paste the contents of: supabase/setup-donor-profiles.sql
# Click "Run" to execute
```

This will:
- Create the `digital_donor_profiles` table
- Set up indexes for performance
- Enable Row Level Security
- Create RLS policies
- Create the `donor-ids` storage bucket
- Set up storage policies

### 3. Verify Setup

Run the diagnostic script:

```bash
# In Supabase SQL Editor, run: supabase/diagnostic-donor-profiles.sql
```

Expected results:
- Table exists: `true`
- Bucket exists: `true`
- RLS policies count: 4
- Storage policies count: 4

### 4. Test the Flow

1. **Sign Up**:
   - Navigate to `/signup`
   - Fill in all fields
   - Upload a valid ID
   - Submit form

2. **Check Email**:
   - You'll be redirected to `/check-email`
   - Check your email for confirmation link
   - Click the link to verify email

3. **Approve Account** (Admin):
   - Go to Supabase Dashboard → Table Editor
   - Find the user in `digital_donor_profiles`
   - Change `status` from 'pending' to 'approved'

4. **Login**:
   - Navigate to `/login`
   - Enter credentials
   - If approved: redirects to `/home`
   - If pending: shows "under review" message
   - If rejected: shows "rejected" message

## User Flow

```
1. User visits /signup
   ↓
2. Fills form + uploads ID
   ↓
3. API uploads ID to storage
   ↓
4. API creates auth user
   ↓
5. API creates donor profile (status: 'pending')
   ↓
6. Redirects to /check-email
   ↓
7. User clicks email confirmation link
   ↓
8. Admin reviews and approves in Supabase
   ↓
9. User logs in at /login
   ↓
10. API checks approval status
   ↓
11. If approved: redirects to /home
    If pending: shows waiting message
    If rejected: shows rejection message
```

## Security Features

1. **Email Privacy**: Email is never exposed in URLs
2. **File Validation**: Only JPG, PNG, PDF files under 5MB
3. **Row Level Security**: Users can only access their own data
4. **Service Role**: Admin operations use service role key
5. **Approval Workflow**: Users must be approved before accessing the app

## Troubleshooting

### Issue: "Missing Supabase configuration"
- Check `.env.local` has correct values
- Restart dev server after changing env vars

### Issue: File upload fails
- Verify `donor-ids` bucket exists in Storage
- Check bucket is set to Public
- Confirm file size < 5MB
- Ensure file type is JPG, PNG, or PDF

### Issue: Donor profile not created
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify RLS policies on `digital_donor_profiles` table
- Check server logs for specific error

### Issue: Login fails with "profile not found"
- Ensure user completed signup process
- Check `digital_donor_profiles` table has record
- Verify `auth_user_id` matches auth.users.id

### Issue: Status not showing "pending"
- Check table schema has correct default
- Verify the migration ran successfully
- Check INSERT statements in signup API

## Admin Tasks

### Approve a User

```sql
UPDATE digital_donor_profiles
SET status = 'approved', updated_at = NOW()
WHERE auth_user_id = 'user-uuid-here';
```

### Reject a User

```sql
UPDATE digital_donor_profiles
SET status = 'rejected', updated_at = NOW()
WHERE auth_user_id = 'user-uuid-here';
```

### View Pending Users

```sql
SELECT 
  id,
  first_name,
  last_name,
  barangay,
  municipality,
  province,
  created_at
FROM digital_donor_profiles
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### View User's Uploaded ID

```sql
SELECT 
  first_name,
  last_name,
  id_verification_key
FROM digital_donor_profiles
WHERE auth_user_id = 'user-uuid-here';
```

Then construct the public URL:
```
https://YOUR_PROJECT.supabase.co/storage/v1/object/public/donor-ids/{id_verification_key}
```

## Files Modified/Created

### API Routes
- ✅ `app/api/auth/signup/route.ts` - Enhanced with profile creation
- ✅ `app/api/auth/login/route.ts` - Enhanced with approval check
- ✅ `app/api/auth/upload-id/route.ts` - New file upload endpoint

### Frontend Pages
- ✅ `app/(auth)/signup/page.tsx` - Updated with donor fields
- ✅ `app/(auth)/login/page.tsx` - Updated with approval messages
- ✅ `app/(auth)/check-email/page.tsx` - New confirmation page

### Database
- ✅ `supabase/setup-donor-profiles.sql` - Database setup script
- ✅ `supabase/diagnostic-donor-profiles.sql` - Diagnostic queries

### Documentation
- ✅ `BACKEND_INTEGRATION_GUIDE.md` - This file

## Next Steps

1. **Create Admin Dashboard**: Build UI for reviewing and approving users
2. **Email Notifications**: Send emails when status changes
3. **Profile Management**: Allow users to update their profile
4. **ID Verification**: Add manual or automated ID verification
5. **Analytics**: Track signup and approval metrics

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs in Dashboard → Logs
3. Check browser console for frontend errors
4. Review server logs for API errors

---

**Status**: ✅ Backend integration complete
**Version**: 1.0.0
**Last Updated**: 2026-04-15
