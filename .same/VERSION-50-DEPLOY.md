# Version 50 Deployment Instructions

**Version:** 50
**Date:** November 26, 2025
**Status:** Ready for deployment after database migration

---

## 🚨 CRITICAL: Apply Database Migration FIRST

**Before deploying, you MUST apply the database migration!**

### Step 1: Go to Supabase SQL Editor

https://supabase.com/dashboard/project/puqcpwznfkpchfxhiglh/sql

### Step 2: Run This SQL

```sql
-- Add email rate limiting columns to users table
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

### Step 3: Verify Migration

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name LIKE '%email%';
```

Should show:
- `email` (text)
- `verification_email_count` (integer, 0)
- `verification_email_last_sent` (timestamp)
- `reset_email_count` (integer, 0)
- `reset_email_last_sent` (timestamp)

---

## 📦 What's New in Version 50

### Text Color Improvements
- All grey text replaced with black/white
- 76 instances updated across 12 files
- Better contrast and readability
- Consistent with settings page

### Email Rate Limiting
- 30-second cooldown between email requests
- 5 email maximum per user (lifetime)
- Prevents spam and conserves API credits
- Clear error messages to users

### Contact Email
- All legal pages updated with support@bunnybox.moe
- Proper mailto: links
- Discord still available as alternative

---

## 🧪 Testing After Deployment

### 1. Email Rate Limiting
```
1. Create new account → should send verification email (1/5)
2. Try to resend immediately → should show cooldown error
3. Wait 30 seconds → should succeed (2/5)
4. Repeat 3 more times → should reach limit (5/5)
5. Try 6th time → should show "contact Discord" message
```

### 2. Text Colors
```
1. Visit homepage in light mode → verify text is black
2. Switch to dark mode → verify text is white
3. Check all pages for consistency
4. Ensure no grey text remains
```

### 3. Contact Information
```
1. Visit Legal page
2. Click each sub-page (ToS, Privacy, AUP, DMCA)
3. Verify support@bunnybox.moe appears
4. Test mailto: links work
```

---

## 🚀 Deploy to Production

After migration is applied:

```bash
# 1. Version 50 is already created
# 2. Migration is applied in Supabase
# 3. Ready to deploy!
```

Use the Same deploy tool or deploy manually to Netlify.

---

## ⚠️ Important Notes

1. **Migration is required** - App will crash without new database columns
2. **Test email limits** - First 5 emails work, 6th shows contact message
3. **API credits** - Rate limiting will save on Resend API costs
4. **Existing users** - Will have NULL values (treated as 0) for email counts

---

## 📊 Metrics to Monitor

After deployment:

- Email sending failures (should be low)
- Rate limit errors (expected for spam attempts)
- User complaints about email limits
- Resend API usage (should decrease)

---

## 🆘 Rollback Plan

If issues occur:

### Rollback Migration:
```sql
ALTER TABLE users
DROP COLUMN IF EXISTS verification_email_count,
DROP COLUMN IF EXISTS verification_email_last_sent,
DROP COLUMN IF EXISTS reset_email_count,
DROP COLUMN IF EXISTS reset_email_last_sent;
```

### Rollback Code:
Revert to Version 49 in Same

---

## ✅ Deployment Checklist

- [ ] Database migration applied in Supabase
- [ ] Migration verified (columns exist)
- [ ] Local testing completed
- [ ] Resend API key updated in Netlify (from v49)
- [ ] Deploy to Netlify
- [ ] Test email rate limiting in production
- [ ] Verify text colors look good
- [ ] Check contact emails work
- [ ] Monitor error logs

---

Made with ❤️ by @.koishi

**Ready to deploy after database migration!**
