# Email Field Update

## What Changed

Added `email` field to the `digital_donor_profiles` table to store the user's email address directly in the profile table, while maintaining the connection to the `auth.users` table.

## Why This Change?

- **Easier Queries**: No need to join with `auth.users` to get email
- **Data Redundancy**: Email is stored in both places for convenience
- **Admin Dashboard**: Easier to display user information
- **Reporting**: Simpler queries for analytics and reports

## Database Changes

### If you already ran the setup script:

Run this SQL in Supabase SQL Editor to add the email field:

```sql
-- Add email column to existing table
ALTER TABLE digital_donor_profiles
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index for email queries
CREATE INDEX IF NOT EXISTS idx_digital_donor_profiles_email 
  ON digital_donor_profiles(email);

-- Optional: Update existing records with email from auth.users
UPDATE digital_donor_profiles dp
SET email = au.email
FROM auth.users au
WHERE dp.auth_user_id = au.id
AND dp.email IS NULL;
```

### If you haven't run the setup script yet:

Just run the updated `supabase/setup-donor-profiles.sql` file - it now includes the email field.

## Code Changes

### ✅ Updated Files:

1. **`app/api/auth/signup/route.ts`**
   - Now includes `email: email` in the `profileData` object
   - Email is stored when creating the donor profile

2. **`supabase/setup-donor-profiles.sql`**
   - Table schema now includes `email VARCHAR(255) NOT NULL`
   - Added index on email field for performance

3. **`supabase/diagnostic-donor-profiles.sql`**
   - Test insert now includes email field

4. **Documentation files**
   - Updated schema tables to show email field
   - Updated example queries to include email

## How It Works

```javascript
// When user signs up:
const profileData = {
  auth_user_id: authData.user.id,  // Links to auth.users
  email: email,                     // Stored in profile table
  first_name: firstName,
  last_name: lastName,
  // ... other fields
};
```

## Benefits

### Before (without email field):
```sql
-- Had to join tables to get email
SELECT dp.*, au.email
FROM digital_donor_profiles dp
JOIN auth.users au ON dp.auth_user_id = au.id
WHERE dp.status = 'pending';
```

### After (with email field):
```sql
-- Direct query, no join needed
SELECT *
FROM digital_donor_profiles
WHERE status = 'pending';
```

## Data Consistency

The email is stored in two places:
1. **`auth.users.email`** - Managed by Supabase Auth (source of truth)
2. **`digital_donor_profiles.email`** - Copy for convenience

**Note**: If a user changes their email in Supabase Auth, you'll need to update the profile table manually or via a trigger.

## Optional: Add Trigger for Email Sync

If you want to keep emails in sync automatically:

```sql
-- Create function to sync email changes
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE digital_donor_profiles
  SET email = NEW.email, updated_at = NOW()
  WHERE auth_user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION sync_profile_email();
```

## Testing

After adding the email field, test:

1. **New Signups**: Email should be stored in profile
2. **Existing Users**: Run the UPDATE query above to populate emails
3. **Admin Queries**: Verify email appears in profile queries
4. **Login**: Should still work as before (uses auth.users)

## Rollback

If you need to remove the email field:

```sql
-- Remove index
DROP INDEX IF EXISTS idx_digital_donor_profiles_email;

-- Remove column
ALTER TABLE digital_donor_profiles
DROP COLUMN IF EXISTS email;
```

---

**Status**: ✅ Complete
**Breaking Changes**: None (backward compatible)
**Migration Required**: Yes (add column to existing tables)
