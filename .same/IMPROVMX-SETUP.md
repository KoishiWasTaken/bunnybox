# ImprovMX Email Setup for Netlify Domains

**For:** Domains registered/managed through Netlify
**Solution:** Email forwarding without changing nameservers
**Cost:** FREE (up to 3 email addresses)
**Time:** 5-10 minutes

---

## 🎯 Why ImprovMX for Netlify Domains?

If your domain is registered with Netlify:
- ✅ Can't easily change nameservers
- ✅ Don't need to - just add MX records!
- ✅ ImprovMX works with any DNS provider
- ✅ Simpler than Cloudflare for just email

---

## 🚀 Setup Guide

### Step 1: Sign Up for ImprovMX

1. Go to: https://improvmx.com/
2. Click "Get started for free"
3. Enter your email and create password
4. Verify your email
5. Log in to dashboard

---

### Step 2: Add Your Domain

1. In ImprovMX dashboard
2. Click "Add domain" (or the + button)
3. Enter your domain: `bunnybox.moe`
4. Click "Add domain"

ImprovMX will show you DNS records to add.

---

### Step 3: Add MX Records in Netlify

1. Go to: https://app.netlify.com
2. Domains → bunnybox.moe → DNS settings
3. Scroll to "DNS records" section
4. Click "Add new record"

**Add Record 1:**
- Record type: **MX**
- Name: **@** (or leave blank for root domain)
- Priority: **10**
- Value: **mx1.improvmx.com**
- TTL: Auto (default)
- Click "Save"

**Add Record 2:**
- Record type: **MX**
- Name: **@** (or leave blank)
- Priority: **20**
- Value: **mx2.improvmx.com**
- TTL: Auto (default)
- Click "Save"

---

### Step 4: Add SPF Record (Optional but Recommended)

This helps with email deliverability:

1. Netlify DNS → "Add new record"
2. Record type: **TXT**
3. Name: **@** (or leave blank)
4. Value: **v=spf1 include:spf.improvmx.com ~all**
5. TTL: Auto
6. Click "Save"

---

### Step 5: Create Email Alias in ImprovMX

1. Back in ImprovMX dashboard
2. Click on bunnybox.moe domain
3. Click "Add alias" or the + button
4. Alias: **support** (creates support@bunnybox.moe)
5. Forward to: **your-personal@email.com** (Gmail, etc.)
6. Click "Add alias" or "Create"

---

### Step 6: Verify Your Email

1. ImprovMX sends verification email to your personal email
2. Check your inbox (and spam folder)
3. Click the verification link
4. Your alias is now active!

---

### Step 7: Wait for DNS Propagation

MX records usually propagate quickly:
- **Average:** 5-15 minutes
- **Maximum:** 24 hours

**Check status:**
- ImprovMX dashboard will show green checkmark when active
- Or use: https://mxtoolbox.com/SuperTool.aspx?action=mx%3abunnybox.moe

---

### Step 8: Test!

1. Send email to: **support@bunnybox.moe**
2. Check your personal email inbox
3. Should arrive within a few seconds!
4. Reply to test that works too

✅ Done! You now have working email!

---

## 📧 How to Reply from support@bunnybox.moe

### Option 1: Quick (Reply from Personal Email)

When support email arrives:
- Just click reply
- ⚠️ Reply will come from your personal email
- Quick but less professional

---

### Option 2: Professional (Send from support@bunnybox.moe)

ImprovMX provides SMTP so you can send FROM support@bunnybox.moe!

#### Get SMTP Password from ImprovMX:

1. ImprovMX dashboard → bunnybox.moe
2. Click on the support@ alias
3. Click "SMTP" tab
4. Create SMTP password
5. Copy the password (save it!)

#### Set Up Gmail to Send from support@bunnybox.moe:

1. Gmail → Settings (gear icon) → "See all settings"
2. "Accounts and Import" tab
3. "Send mail as:" section → "Add another email address"
4. Name: **bunnybox Support**
5. Email: **support@bunnybox.moe**
6. Click "Next"
7. SMTP Server: **smtp.improvmx.com**
8. Port: **587**
9. Username: **support@bunnybox.moe**
10. Password: [Your SMTP password from ImprovMX]
11. Click "Add Account"
12. Verify the confirmation email
13. Done!

Now when composing emails in Gmail:
- Click "From" dropdown
- Select "support@bunnybox.moe"
- Professional! ✨

---

## 🎨 Email Signature (Optional)

Add a professional signature:

1. Gmail → Settings → General
2. Scroll to "Signature"
3. Create new signature:

```
--
bunnybox Support
https://bunnybox.moe

Need help? Reply to this email!
```

4. Set it as default for support@bunnybox.moe
5. Save

---

## 📊 Your DNS Records Should Look Like

In Netlify DNS, you should now have:

**MX Records:**
```
Type: MX    Name: @    Priority: 10    Value: mx1.improvmx.com
Type: MX    Name: @    Priority: 20    Value: mx2.improvmx.com
```

**TXT Record (SPF):**
```
Type: TXT   Name: @    Value: v=spf1 include:spf.improvmx.com ~all
```

**Plus your existing records:**
- A or CNAME for site hosting
- Any other records you had

---

## 📈 Features

### Free Plan Includes:
- ✅ 3 email addresses (support@, hello@, contact@)
- ✅ Unlimited email forwarding
- ✅ SMTP sending (with setup)
- ✅ No ads in forwarded emails
- ✅ Email aliasing

### Limitations:
- ⚠️ Max 3 email addresses (upgrade for more)
- ⚠️ No webmail interface (emails forward to your inbox)
- ⚠️ Basic spam filtering (relies on your email provider)

---

## 🧪 Testing Checklist

- [ ] Send email to support@bunnybox.moe from another account
- [ ] Check it arrives in your personal inbox
- [ ] Reply to the email
- [ ] Verify reply sends successfully
- [ ] (If set up SMTP) Send new email from support@bunnybox.moe
- [ ] Check email doesn't go to spam

---

## ⚠️ Troubleshooting

### Emails not arriving?

1. **Check DNS propagation:**
   - https://mxtoolbox.com/SuperTool.aspx?action=mx%3abunnybox.moe
   - Should show mx1.improvmx.com and mx2.improvmx.com

2. **Check spam folder:**
   - First few emails might go to spam
   - Mark as "Not spam"

3. **Check ImprovMX dashboard:**
   - Should show green checkmark
   - Check alias is verified

4. **Wait longer:**
   - DNS can take up to 24 hours
   - Usually works in 15 minutes though

### Emails going to spam?

1. Add SPF record (see Step 4)
2. Ask sender to add support@bunnybox.moe to contacts
3. Mark first email as "Not spam"
4. Future emails should arrive in inbox

### Can't send from support@bunnybox.moe?

1. Make sure you created SMTP password in ImprovMX
2. Check SMTP settings in Gmail are correct
3. Port should be 587 (not 465 or 25)
4. TLS should be enabled

---

## 💡 Pro Tips

1. **Multiple emails:** Create hello@ and contact@ too (free on same plan)
2. **Catch-all:** ImprovMX supports wildcards (*@bunnybox.moe → your email)
3. **Auto-reply:** Set up Gmail vacation responder for support@ if needed
4. **Labels:** Create Gmail label "Support" to organize these emails

---

## 🔄 Adding More Email Addresses

Want hello@bunnybox.moe or contact@bunnybox.moe?

1. ImprovMX dashboard → bunnybox.moe
2. Click "Add alias"
3. Alias: `hello` or `contact`
4. Forward to: Your email (or different one)
5. Verify
6. Done!

Free plan allows 3 total aliases.

---

## 📝 Summary

**What you did:**
- ✅ Added MX records to Netlify DNS
- ✅ Created email forwarding in ImprovMX
- ✅ support@bunnybox.moe → your personal email
- ✅ (Optional) Set up SMTP to send from support@

**What you didn't do:**
- ❌ Change nameservers (stayed with Netlify)
- ❌ Pay anything (completely free)
- ❌ Break your website (everything still works)

**Result:**
- 🎉 Working professional support email
- 🎉 Receive support requests
- 🎉 Reply professionally
- 🎉 All in 10 minutes!

---

## ✅ Final Checklist

- [ ] ImprovMX account created
- [ ] bunnybox.moe added to ImprovMX
- [ ] MX records added in Netlify
- [ ] SPF record added in Netlify
- [ ] support@ alias created
- [ ] Personal email verified
- [ ] Test email sent and received
- [ ] (Optional) Gmail SMTP configured
- [ ] (Optional) Email signature added
- [ ] Ready to receive support emails! 🎉

---

**Next step:** Deploy version 50 and your support email will be fully functional!

Made with ❤️ by @.koishi
