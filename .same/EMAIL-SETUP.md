# Email Verification Setup Guide

This guide will help you set up the email verification system for bunnybox.

## Prerequisites

- A domain name (for sending emails from a professional address)
- Access to your domain's DNS settings

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

## Step 2: Add Your Domain

1. In the Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain name (e.g., `send.bunnybox.moe` - use a subdomain!)
4. Follow the DNS verification steps:
   - Add the provided TXT records to your domain's DNS settings
   - Add the provided MX records (if you want to receive emails)
   - **⚠️ IMPORTANT FOR NETLIFY USERS:** Add a trailing period (`.`) to the MX record value!
   - Wait for DNS propagation (usually a few minutes, can take up to 48 hours)

### 🚨 Critical Netlify Fix

If using Netlify DNS, your MX record MUST end with a period (`.`):

**Correct:**
```
feedback-smtp.eu-west-1.amazonses.com.
```

**Wrong:**
```
feedback-smtp.eu-west-1.amazonses.com
```

Without the trailing period, Netlify will auto-append `.bunnybox.moe` and break verification!

## Step 3: Update the Email Sending Domain

Open `bunnybox/src/lib/email.ts` and update line 32:

```typescript
from: 'bunnybox <noreply@YOUR-DOMAIN.com>',
```

Replace `YOUR-DOMAIN.com` with your actual domain (e.g., `bunbox.cc`).

## Step 4: Get Your API Key

1. In the Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Give it a name (e.g., "bunnybox-production")
4. Select "Full Access" or "Sending Access"
5. Click "Create"
6. **Important:** Copy the API key immediately (it won't be shown again)

## Step 5: Add the API Key to Environment Variables

Add the following line to your `.env.local` file:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Replace the `re_xxx...` with your actual API key from Step 4.

## Step 6: Run Database Migration

Run the SQL migration to add email verification columns to your database:

```sql
-- Run this in your Supabase SQL Editor
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS verification_code TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
```

Or run the migration file:
```bash
psql -U your_user -d your_database -f .same/migrations/add_email_verification.sql
```

## Step 7: Test the System

1. Restart your development server
2. Try creating a new account with your email address
3. Check your inbox for the verification code
4. Enter the code in the activation popup

## Troubleshooting

### Emails not sending

- Check that your RESEND_API_KEY is correctly set in `.env.local`
- Verify your domain is verified in the Resend dashboard
- Check the server console for error messages
- Make sure you're sending from the correct domain (must match DNS records)

### DNS not verifying

- DNS propagation can take up to 48 hours
- Use [dnschecker.org](https://dnschecker.org) to verify your DNS records are propagating
- Make sure you added ALL required DNS records (TXT, MX, etc.)

### Users not receiving codes

- Check spam folder
- Verify the email address is correct
- Use the "Get a new code" button to resend
- Check Resend dashboard logs for delivery status

## Email Templates

The system sends two types of emails:

1. **Verification Code Email** - Sent when creating account or changing email
2. **Password Change Confirmation** - Sent when password is changed

To customize these templates, edit `bunnybox/src/lib/email.ts`.

## Rate Limits

Resend free tier includes:
- 100 emails per day
- 3,000 emails per month

For production use with more users, consider upgrading to a paid plan.

## Security Notes

- Verification codes are 8 characters (lowercase letters and numbers)
- Codes are stored hashed in the database
- Codes are invalidated after successful verification
- Email addresses must be unique per account
- Unverified users cannot upload files (if they have an email on record)

## Support

For issues with Resend, contact their support or check their documentation at [resend.com/docs](https://resend.com/docs).

For issues with bunnybox email verification, contact @.koishi on Discord.
