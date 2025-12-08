# Testing Email Verification System

## Quick Test Steps

### 1. Sign Up with New Account
1. Go to your deployed site: https://bunnybox.moe
2. Click "Sign In / Sign Up"
3. Click "Create Account"
4. Enter:
   - Username: `testuser123`
   - Email: **your-actual-email@gmail.com** (use your real email!)
   - Password: `testpass123`
5. Click "Sign Up"

### 2. Check Your Email
- Open your email inbox
- Look for email from: `bunnybox <noreply@bunnybox.moe>`
- Subject: "Verify your bunnybox account"
- Should contain an 8-character verification code

### 3. Activate Account
- The activation popup should show automatically
- Enter the 8-character code from email
- Click "Activate"
- Account should be verified! ✅

### 4. Test Resend Code
- Before activating, click "Get a new code"
- Check email for new verification code
- Should receive another email

### 5. Test File Upload
- After activation, try uploading a file
- Should work without verification errors

### 6. Test Email Change (Settings)
1. Go to Settings page
2. Change email to another address
3. Enter your password
4. Click "Update Email"
5. Check new email for verification code
6. Activate again

### 7. Test Password Change
1. In Settings, change password
2. Enter current password and new password
3. Click "Update Password"
4. Check email for password change confirmation

## Expected Emails

You should receive emails for:
- ✅ Account signup verification
- ✅ Resend verification code
- ✅ Email change verification
- ✅ Password change confirmation

## Troubleshooting

### Email not arriving?
- Check spam/junk folder
- Wait 1-2 minutes (can be delayed)
- Verify domain is "Verified" in Resend dashboard
- Check Resend logs: https://resend.com/emails

### Code not working?
- Make sure you copied all 8 characters
- Code is case-insensitive
- Request new code if expired
- Check for typos

### Still not working?
- Check Resend dashboard for delivery logs
- Verify RESEND_API_KEY in .env.local
- Check browser console for errors
- Check server logs for email sending errors

## Success Criteria

 Verification email arrives in inbox (not spam)
 Email has proper formatting and branding
 Verification code works
 Resend code feature works
 Email change sends new verification
 Password change sends confirmation

