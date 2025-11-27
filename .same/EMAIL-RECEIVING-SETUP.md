# Email Receiving Setup - support@bunnybox.moe

**Current Status:** Email address referenced in code but NOT configured yet
**Action Required:** Set up email receiving to handle support inquiries

---

## 📧 What You Have Now

✅ **Sending emails** - Resend configured for sending (verification, password reset)
❌ **Receiving emails** - NOT configured yet

**Problem:** Users can click support@bunnybox.moe but emails will bounce!

---

## 🎯 Options for Receiving Emails

### Option 1: Email Forwarding (Recommended - Free & Easy)

Forward all support@bunnybox.moe emails to your personal email.

**Pros:**
- Free
- Easy to set up (5 minutes)
- Receive emails in your existing inbox
- No new email client needed

**Cons:**
- Replies come from your personal email
- Less professional

**Best for:** Solo developer, small projects

---

### Option 2: Full Email Hosting

Create an actual mailbox for support@bunnybox.moe.

**Pros:**
- Professional
- Replies come from support@bunnybox.moe
- Separate from personal email
- Can share with team

**Cons:**
- Usually costs money ($5-10/month)
- Need to check another inbox
- More setup

**Best for:** Professional projects, teams

---

## 🚀 Setup Guide: Email Forwarding (Recommended)

Since bunnybox.moe is on **Netlify**, you have a few options:

### Method 1: Cloudflare Email Routing (FREE & BEST)

Cloudflare offers free email forwarding for any domain.

#### Step 1: Transfer DNS to Cloudflare (if not already)

1. Go to: https://dash.cloudflare.com
2. Add site: bunnybox.moe
3. Follow instructions to update nameservers at your domain registrar

#### Step 2: Enable Email Routing

1. In Cloudflare dashboard → Email → Email Routing
2. Click "Get started"
3. Cloudflare will automatically create DNS records

#### Step 3: Create Forwarding Rule

1. Click "Create address"
2. Custom address: `support@bunnybox.moe`
3. Destination: Your personal email (e.g., your Gmail)
4. Click "Save"

#### Step 4: Verify

1. Cloudflare will send verification email to your personal email
2. Click the verification link
3. Done! Test by emailing support@bunnybox.moe

**Cost:** FREE forever
**Time:** 10-15 minutes

---

### Method 2: ImprovMX (FREE Email Forwarding)

If you don't want to use Cloudflare:

#### Step 1: Sign up

Go to: https://improvmx.com/

#### Step 2: Add Domain

1. Add bunnybox.moe
2. ImprovMX will give you DNS records to add

#### Step 3: Add DNS Records

Add these to Netlify DNS (or wherever your DNS is):

```
Type: MX
Name: @
Priority: 10
Value: mx1.improvmx.com

Type: MX
Name: @
Priority: 20
Value: mx2.improvmx.com
```

#### Step 4: Create Alias

1. In ImprovMX dashboard
2. Create alias: support → your personal email
3. Verify your personal email

**Cost:** FREE (up to 3 email addresses)
**Time:** 10 minutes

---

### Method 3: Zoho Mail (FREE with Custom Domain)

Free email hosting with actual mailbox:

1. Go to: https://www.zoho.com/mail/
2. Sign up for free plan (1 user)
3. Add bunnybox.moe domain
4. Add DNS records they provide
5. Create support@bunnybox.moe mailbox
6. Access via webmail or email client

**Cost:** FREE (1 user, 5GB storage)
**Time:** 20 minutes

---

## 📝 My Recommendation

**Use Cloudflare Email Routing** because:
- ✅ Completely free forever
- ✅ Unlimited email addresses
- ✅ Super reliable
- ✅ 5-minute setup
- ✅ No inbox to check (goes to your email)
- ✅ Good spam protection

---

## 🔧 DNS Records You'll Need

Depending on which method you choose, you'll add MX records to your DNS.

### Where to Add DNS Records

Your domain bunnybox.moe DNS is likely managed by:
- Netlify DNS, OR
- Your domain registrar (where you bought the domain)

**To check:** Look at your domain's nameservers:
```bash
dig bunnybox.moe NS
```

---

## ✅ After Setup - Test It!

1. **Send test email:**
   - Email support@bunnybox.moe from another email
   - Check if you receive it

2. **Test from website:**
   - Go to Legal page on bunnybox.moe
   - Click support@bunnybox.moe link
   - Send email from your email client
   - Verify it arrives

3. **Reply test:**
   - Reply to a test email
   - Make sure the recipient gets it

---

## 🎨 Making Replies Professional

When replying to support emails:

### Option A: Use Gmail Alias (if forwarding to Gmail)

1. Gmail Settings → Accounts and Import
2. Add another email address: support@bunnybox.moe
3. Use SMTP settings from your email provider
4. Now you can send FROM support@bunnybox.moe

### Option B: Use Resend for Replies

Since you already have Resend configured:

1. Resend can send from support@bunnybox.moe
2. Just need to verify the email in Resend dashboard
3. Reply manually or build a support ticket system

---

## 📊 Current DNS Setup

Check your current DNS records:

```bash
# Check nameservers
dig bunnybox.moe NS

# Check MX records (email)
dig bunnybox.moe MX

# Check TXT records (SPF, DKIM)
dig bunnybox.moe TXT
```

---

## 🆘 Troubleshooting

### Emails bouncing?
- Check MX records are correct
- Wait 24-48 hours for DNS propagation
- Verify your personal email with the service

### Not receiving emails?
- Check spam folder
- Verify forwarding rule is active
- Test with multiple email providers

### Can't reply from support@bunnybox.moe?
- Set up SMTP sending (see Option A above)
- Or use Resend API to send replies

---

## 📋 Quick Start Checklist

- [ ] Choose email receiving method
- [ ] Set up email forwarding or hosting
- [ ] Add DNS records
- [ ] Verify your personal email
- [ ] Send test email to support@bunnybox.moe
- [ ] Receive and reply to test
- [ ] Update documentation with your choice

---

## 💡 Future: Build Support Ticket System

Once email receiving works, you could build:

- Contact form on website (sends to support@bunnybox.moe)
- Support ticket system with Resend API
- Auto-responder for common questions
- Email notification system for users

---

## 🔗 Useful Links

- **Cloudflare Email Routing:** https://developers.cloudflare.com/email-routing/
- **ImprovMX:** https://improvmx.com/
- **Zoho Mail:** https://www.zoho.com/mail/
- **Resend Docs:** https://resend.com/docs

---

Made with ❤️ by @.koishi

**Choose a method and set it up in ~10 minutes!**
