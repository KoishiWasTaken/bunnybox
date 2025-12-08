# Email Verification Setup Checklist

## What You Need to Do

### 1. Database Migration (Required)
Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS verification_code TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
```

### 2. Set Up Resend Email Service (Required)

1. **Create Resend account**: Go to [resend.com](https://resend.com) and sign up (free tier: 100 emails/day)

2. **Add your domain**:
   - In Resend dashboard → Domains → Add Domain
   - Enter your domain (e.g., `bunbox.cc`)
   - Add the DNS records they provide to your domain registrar

3. **Get API key**:
   - In Resend dashboard → API Keys → Create API Key
   - Copy the key (starts with `re_...`)

4. **Add to environment variables**:
   Add this line to your `.env.local` file:
   ```
   RESEND_API_KEY=re_your_key_here
   ```

5. **Update email sending domain**:
   Edit `bunnybox/src/lib/email.ts` line 32:
   ```typescript
   from: 'bunnybox <noreply@your-domain.com>',
   ```
   Replace `your-domain.com` with your actual domain.

### 3. Test Everything

1. Restart your development server
2. Create a new account with your email
3. Check your email for the verification code
4. Enter the code in the activation popup

## What's New

✅ Email verification for new accounts
✅ 8-character verification codes sent via email
✅ Settings page with:
  - Change email (requires password)
  - Change password (requires current password)
  - Delete account (moved from dashboard)
✅ Persistent activation popup for unverified users
✅ Resend code functionality
✅ Users with email must verify before uploading
✅ Backward compatibility (existing users without email can still upload)

## Detailed Guide

See `.same/EMAIL-SETUP.md` for comprehensive setup instructions and troubleshooting.

## Support

Having issues? Contact @.koishi on Discord.
