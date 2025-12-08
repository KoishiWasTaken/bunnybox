# Database Migration Instructions - Email Rate Limiting

## Migration: Add Email Rate Limiting

**Date:** November 26, 2025
**Version:** 50

---

## What This Migration Does

Adds email rate limiting to prevent abuse:
- **30-second cooldown** between email requests
- **Hard limit of 5 emails** per user (verification + password reset separately)
- When limit reached, user must contact @.koishi on Discord

---

## How to Apply

### Option 1: Supabase SQL Editor (Recommended)

1. Go to: https://supabase.com/dashboard/project/puqcpwznfkpchfxhiglh/sql
2. Copy the SQL below
3. Click "Run"

```sql
-- Add email rate limiting columns to users table
-- This migration adds fields to track email sending for verification and password reset

-- Add columns for verification email rate limiting
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_email_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_email_last_sent TIMESTAMP,
ADD COLUMN IF NOT EXISTS reset_email_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reset_email_last_sent TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN users.verification_email_count IS 'Total number of verification emails sent (max 5)';
COMMENT ON COLUMN users.verification_email_last_sent IS 'Timestamp of last verification email sent (30-second cooldown)';
COMMENT ON COLUMN users.reset_email_count IS 'Total number of password reset emails sent (max 5)';
COMMENT ON COLUMN users.reset_email_last_sent IS 'Timestamp of last password reset email sent (30-second cooldown)';
```

---

## Verification

After running, verify the columns exist:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name LIKE '%email%';
```

Should show:
- `verification_email_count` (integer, default 0)
- `verification_email_last_sent` (timestamp)
- `reset_email_count` (integer, default 0)
- `reset_email_last_sent` (timestamp)

---

## Rollback (if needed)

If you need to rollback:

```sql
ALTER TABLE users
DROP COLUMN IF EXISTS verification_email_count,
DROP COLUMN IF EXISTS verification_email_last_sent,
DROP COLUMN IF EXISTS reset_email_count,
DROP COLUMN IF EXISTS reset_email_last_sent;
```

---

## Changes Made in Code

Updated API routes:
- `/api/auth/signup` - Initialize count to 1 for first verification email
- `/api/auth/resend-code` - Check cooldown and limit before sending
- `/api/auth/request-reset` - Check cooldown and limit before sending

---

## Testing

After migration:

1. **Test Verification Email Cooldown:**
   - Create new account
   - Try resending verification code immediately
   - Should get "Please wait X seconds" error
   - Wait 30 seconds, should succeed

2. **Test Hard Limit:**
   - Request verification code 4 more times (total 5)
   - 6th request should show "Email limit reached. Please contact @.koishi on Discord"

3. **Test Password Reset:**
   - Same as above but for password reset

---

## Notes

- Existing users will have `NULL` values, which are treated as 0
- First email sent will initialize the counters
- Limit is per user, per email type (verification vs reset)
- Limit is permanent - contact @.koishi to reset
