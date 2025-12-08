# Quick Email Setup - support@bunnybox.moe

**Status:** ❌ Email receiving NOT configured yet
**Time needed:** 10 minutes
**Recommended:** Cloudflare Email Routing (FREE)

---

## 🚨 Current Situation

**Problem:** You added support@bunnybox.moe to the website, but it doesn't exist!

- ✅ Users can click the email link
- ❌ But emails will BOUNCE (not delivered)
- ❌ You can't receive support requests

**Solution:** Set up email forwarding in 10 minutes (FREE)

---

## 🎯 Fastest Solution: Cloudflare Email Routing

**Cost:** FREE forever
**Time:** 10 minutes
**Difficulty:** Easy

### What it does:
- Forwards support@bunnybox.moe → your personal email (Gmail, etc.)
- You receive support emails in your normal inbox
- No new inbox to check!

### Steps:

#### 1. Sign up for Cloudflare (if you haven't)
https://dash.cloudflare.com/sign-up

#### 2. Add your domain
1. Click "Add a site"
2. Enter: bunnybox.moe
3. Select FREE plan
4. Cloudflare will scan your DNS

#### 3. Update Nameservers
Cloudflare will give you 2 nameservers like:
```
name1.cloudflare.com
name2.cloudflare.com
```

Go to wherever you bought bunnybox.moe and update the nameservers to these.

**Wait 10-60 minutes for DNS to propagate.**

#### 4. Set up Email Routing
1. In Cloudflare dashboard → Email → Email Routing
2. Click "Get started"
3. Cloudflare auto-configures DNS
4. Click "Create address"
5. Custom address: `support`
6. Destination: Your personal email
7. Click "Save"

#### 5. Verify
1. Check your personal email for verification link
2. Click to verify
3. Test by emailing support@bunnybox.moe
4. Should arrive in your personal inbox!

✅ Done! Now you can receive support emails.

---

## 📧 How to Reply to Support Emails

When someone emails support@bunnybox.moe:

### Option 1: Reply from Personal Email (Quick)
- Email arrives in your Gmail/etc
- Just hit reply
- ⚠️ Reply will come from your personal email

### Option 2: Reply from support@bunnybox.moe (Professional)

**Using Gmail:**
1. Gmail Settings → Accounts and Import
2. "Send mail as" → Add another email
3. Name: bunnybox Support
4. Email: support@bunnybox.moe
5. Use SMTP server (see Resend settings below)

**SMTP Settings for Resend:**
- SMTP Server: smtp.resend.com
- Port: 465 (SSL) or 587 (TLS)
- Username: resend
- Password: Your Resend API key

Now you can select "From: support@bunnybox.moe" when replying!

---

## 🔄 Alternative: ImprovMX (if you don't want Cloudflare)

**Cost:** FREE
**Time:** 10 minutes
**No nameserver change needed**

### Steps:

1. Go to https://improvmx.com/
2. Sign up (free)
3. Add domain: bunnybox.moe
4. Add these DNS records to Netlify (or wherever your DNS is):

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

5. Create alias: support → your personal email
6. Verify your email
7. Test!

---

## 🧪 Testing

After setup:

```
1. Send email to: support@bunnybox.moe
2. Check your personal inbox
3. Reply to the email
4. Verify reply sends
```

---

## ⚠️ Important Notes

**Before replying:**
- Make sure "From" is set correctly
- Use professional tone (it's support!)
- Consider setting up email signature

**Privacy:**
- Don't share your personal email with users
- Use support@bunnybox.moe for all public communications

**Spam protection:**
- Cloudflare/ImprovMX have spam filtering
- Mark spam in your inbox as usual

---

## 📊 What to Do Now

**Choose ONE:**

☑️ **Option A: Cloudflare Email Routing** (Recommended)
   - Best for: Most users
   - Pros: Free, unlimited forwards, reliable
   - Cons: Need to change nameservers

☑️ **Option B: ImprovMX**
   - Best for: If you can't change nameservers
   - Pros: Free, easy, just add MX records
   - Cons: Limit of 3 email addresses

---

## 🆘 Need Help?

If you get stuck:
1. Check the full guide: `.same/EMAIL-RECEIVING-SETUP.md`
2. Contact Cloudflare/ImprovMX support
3. Search their documentation

---

## ✅ Success Checklist

- [ ] Choose email forwarding service
- [ ] Set up account
- [ ] Add DNS records (if needed)
- [ ] Create support@bunnybox.moe forward
- [ ] Verify your personal email
- [ ] Send test email
- [ ] Receive test email ✨
- [ ] Set up reply-from support@bunnybox.moe (optional)
- [ ] Add email signature (optional)

---

**Start now:** Go to https://dash.cloudflare.com and set it up!

It only takes 10 minutes and it's completely FREE. 🎉
