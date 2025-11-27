# 🚀 Pre-Deployment Checklist for Version 46

## ✅ What's New in This Version

### Password Reset System
- ✅ Email-based password reset with one-time secure links
- ✅ Reset links expire in 1 hour
- ✅ Password confirmation field on reset page
- ✅ Beautiful email templates with reset buttons

### Enhanced Authentication
- ✅ Sign in with email OR username
- ✅ Dev key recovery for accounts without email
- ✅ Automatic fallback to dev key if no email

### Updated Legal Pages
- ✅ FAQ updated with email verification info
- ✅ Privacy Policy updated with email usage
- ✅ Terms of Service updated with verification requirements

---

## 📋 Required Database Migration

**IMPORTANT:** Run this SQL migration in your Supabase SQL Editor BEFORE deploying:

```sql
-- Add password reset columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
```

### How to Run Migration:
1. Go to: https://supabase.com/dashboard/project/YOUR-PROJECT/sql
2. Copy the SQL above
3. Click "Run" or paste and execute
4. Verify columns were added

---

## 🔑 Environment Variables Checklist

Make sure these are set in **both** places:

### Local (.env.local)
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [x] `RESEND_API_KEY`
- [x] `NEXT_PUBLIC_BASE_URL` (https://bunnybox.moe)
- [x] `CLEANUP_API_KEY`

### Netlify Environment Variables
Go to: Netlify Dashboard → Site Settings → Environment Variables

Add ALL of these:
```
NEXT_PUBLIC_SUPABASE_URL=https://puqcpwznfkpchfxhiglh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
SUPABASE_SERVICE_ROLE_KEY=[your service role key]
RESEND_API_KEY=[your resend API key]
NEXT_PUBLIC_BASE_URL=https://bunnybox.moe
CLEANUP_API_KEY=[your cleanup key]
```

---

## 🧪 Pre-Deployment Testing

### Test Locally First

1. **Test Password Reset (Email)**
   - Go to http://localhost:3000
   - Click "Sign In / Sign Up" → "Forgot Password?"
   - Enter a username with email
   - Check email for reset link
   - Click link, set new password
   - Verify redirect to home page
   - Sign in with new password

2. **Test Dev Key Fallback**
   - Create account WITHOUT email
   - Try "Forgot Password?"
   - Should automatically show dev key option
   - Test dev key recovery

3. **Test Sign In with Email**
   - Sign in using your email instead of username
   - Should work with password

4. **Test Email Verification**
   - Create new account with email
   - Check for verification email
   - Enter code in activation popup
   - Verify account activates

---

## 📧 Email Testing Checklist

Make sure Resend is working:

- [ ] Domain verified in Resend dashboard (bunnybox.moe)
- [ ] Test verification email sends
- [ ] Test password reset email sends
- [ ] Test password change confirmation sends
- [ ] Emails arrive in inbox (not spam)
- [ ] Links in emails work correctly
- [ ] Email templates look good

---

## 🌐 DNS Verification

Double-check your DNS is still working:

Visit: https://dns.email/?q=bunnybox.moe

Should show:
- ✅ DKIM record (starts with `v=DKIM1`)
- ✅ SPF record (`v=spf1 include:amazonses.com ~all`)
- ✅ MX record (points to `feedback-smtp.[region].amazonses.com`)

---

## 🔒 Security Checklist

- [ ] Reset tokens are stored securely in database
- [ ] Reset links expire after 1 hour
- [ ] Reset tokens are deleted after use
- [ ] Password requirements enforced (8-24 chars)
- [ ] Passwords confirmed on reset page
- [ ] Email verification required before uploads
- [ ] Sign-in accepts both username and email

---

## 📝 Feature Testing Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Sign up with email | ✅ | Sends verification code |
| Email verification | ✅ | 8-char code |
| Sign in with username | ✅ | Works as before |
| Sign in with email | ✅ | New feature |
| Forgot password (with email) | ✅ | Sends reset link |
| Forgot password (no email) | ✅ | Shows dev key option |
| Reset password page | ✅ | Confirms password |
| Password change notification | ✅ | Email sent |
| Email change | ✅ | Re-verification required |
| Upload with verified account | ✅ | Works |
| Upload with unverified account | ❌ | Blocked correctly |

---

## 🚀 Deployment Steps

### Option 1: Deploy via Netlify Dashboard

1. **Go to Netlify:**
   - https://app.netlify.com
   - Select your site

2. **Trigger Deploy:**
   - Deploys → Trigger deploy → Deploy site
   - OR
   - Make a commit and push to trigger auto-deploy

3. **Wait for Build:**
   - Monitor build logs
   - Should complete in 2-3 minutes

4. **Verify Environment Variables:**
   - Site Settings → Environment Variables
   - Make sure ALL variables are set

### Option 2: Deploy from Same

Use the deploy tool:
- Dynamic site deployment
- Netlify will handle Next.js automatically

---

## ✅ Post-Deployment Verification

After deployment, test on https://bunnybox.moe:

1. **Test Password Reset**
   - [ ] Request reset for account with email
   - [ ] Check email arrives
   - [ ] Click link goes to reset page
   - [ ] Reset password works
   - [ ] Old password no longer works
   - [ ] New password works
   - [ ] Confirmation email received

2. **Test Dev Key Fallback**
   - [ ] Try reset for account without email
   - [ ] Dev key option shown
   - [ ] Dev key recovery works

3. **Test Sign In**
   - [ ] Sign in with username works
   - [ ] Sign in with email works
   - [ ] Wrong password fails correctly

4. **Test Email Verification**
   - [ ] New signup sends verification email
   - [ ] Code works
   - [ ] Resend code works
   - [ ] Can upload after verification

---

## 🐛 Troubleshooting

### Reset Email Not Arriving
- Check spam folder
- Verify RESEND_API_KEY in Netlify
- Check Resend dashboard logs
- Verify domain is verified

### Reset Link Invalid
- Check NEXT_PUBLIC_BASE_URL is correct
- Verify database migration ran
- Check link hasn't expired (1 hour)
- Make sure link hasn't been used already

### Sign In with Email Not Working
- Verify database has email column
- Check email is stored in database
- Verify signin API accepts email OR username

### Emails Going to Spam
- Check Resend domain verification
- Consider adding DMARC record
- Check email content for spam triggers

---

## 📊 Success Criteria

Deployment is successful when:

- ✅ All existing features still work
- ✅ Password reset emails send successfully
- ✅ Reset links work and expire correctly
- ✅ Sign in accepts email or username
- ✅ Dev key fallback works for no-email accounts
- ✅ FAQ and Legal pages updated
- ✅ No console errors
- ✅ No runtime errors in Netlify logs

---

## 🎯 Ready to Deploy?

### Final Checklist:
- [ ] Database migration completed
- [ ] Environment variables set in Netlify
- [ ] Resend domain verified
- [ ] Tested locally
- [ ] Read troubleshooting guide
- [ ] Ready to monitor deployment

### Deploy Command:
```bash
# From bunnybox directory
git add .
git commit -m "feat: password reset system with email and enhanced auth"
git push
```

Or use Same's deploy tool for dynamic deployment.

---

**Version:** 46
**Date:** November 26, 2025
**New Features:** Password reset, email sign-in, enhanced auth
**Database Changes:** Added reset_token and reset_token_expires columns
**Email Changes:** Added password reset email template

🎉 **You're ready to deploy!**
