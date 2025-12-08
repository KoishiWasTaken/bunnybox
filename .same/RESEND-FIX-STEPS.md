# IMMEDIATE ACTION PLAN: Fix Resend DNS Verification

## 🎯 Quick Fix (Most Likely Solution)

The #1 issue with Netlify + Resend is **auto-appending domain names** to MX records.

### Step 1: Check Your Netlify DNS Records

1. Go to: https://app.netlify.com/sites/[your-site]/configuration/domains
2. Click on "bunnybox.moe"
3. Go to "DNS records" or "DNS settings"

### Step 2: Find Your MX Record

Look for the MX record under `send.bunnybox.moe` subdomain.

**PROBLEM:** If the value shows:
```
feedback-smtp.eu-west-1.amazonses.com.bunnybox.moe
```

This is WRONG! ❌ Netlify auto-appended your domain.

**SOLUTION:** Edit the MX record and add a **trailing period**:
```
feedback-smtp.eu-west-1.amazonses.com.
```
☝️ **The period at the end is CRITICAL!**

### Step 3: Verify All Records

Make sure you have these 3 records for `send.bunnybox.moe`:

| Type | Name | Value | Priority |
|------|------|-------|----------|
| TXT | `resend._domainkey.send` | [Long DKIM value from Resend] | - |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | - |
| MX | `send` | `feedback-smtp.[region].amazonses.com.` | 10 |

**IMPORTANT:**
- MX value MUST end with a period (`.`)
- The region could be `us-east-1`, `eu-west-1`, `ap-northeast-1`, or `sa-east-1`
- Check your Resend dashboard for the exact region

### Step 4: Wait and Verify

1. Save all changes in Netlify
2. Wait **15-30 minutes** for DNS propagation
3. Check your DNS with: https://dns.email/?q=send.bunnybox.moe
4. Go to Resend dashboard → Click **"Restart Verification"**

---

## 🔍 Diagnostic Checklist

Run through this checklist to identify the issue:

### A. Verify Records Exist in Netlify

- [ ] TXT record for `resend._domainkey.send.bunnybox.moe` exists
- [ ] TXT record for `send.bunnybox.moe` with SPF value exists
- [ ] MX record for `send.bunnybox.moe` exists

### B. Check Record Values

- [ ] DKIM record value matches exactly from Resend (no extra quotes)
- [ ] SPF record is exactly: `v=spf1 include:amazonses.com ~all`
- [ ] MX record ends with a **period** (`.`)
- [ ] MX priority is `10`

### C. Check DNS Propagation

- [ ] Changes saved in Netlify at least 30 minutes ago
- [ ] Checked with https://dns.email/?q=send.bunnybox.moe
- [ ] Records show up correctly in DNS checker
- [ ] Clicked "Restart Verification" in Resend

### D. Verify Nameservers

- [ ] Nameservers for bunnybox.moe point to Netlify
- [ ] Not using external DNS (Cloudflare, Google, etc.)
- [ ] No conflicting DNS providers

---

## 🚨 Common Mistakes

### Mistake #1: Adding to Wrong Subdomain
❌ Adding records to root `bunnybox.moe`
✅ Add records to `send.bunnybox.moe` (or your chosen subdomain)

### Mistake #2: Missing Trailing Period
❌ `feedback-smtp.eu-west-1.amazonses.com`
✅ `feedback-smtp.eu-west-1.amazonses.com.`

### Mistake #3: Extra Quotes in DKIM
❌ `"v=DKIM1; k=rsa; p=..."`
✅ `v=DKIM1; k=rsa; p=...` (no quotes)

### Mistake #4: Wrong Region in MX
❌ Using `us-east-1` when Resend shows `eu-west-1`
✅ Match the exact region from Resend dashboard

### Mistake #5: Not Waiting Long Enough
❌ Checking immediately after adding records
✅ Wait at least 15-30 minutes, up to 24 hours

---

## 🎬 Alternative Approach: Use Different Subdomain

If you're still having issues, try using a different subdomain:

### Option 1: Use `mail` subdomain
```
mail.bunnybox.moe
```

### Option 2: Use `updates` subdomain
```
updates.bunnybox.moe
```

### Steps:
1. In Resend dashboard → Domains → Remove `send.bunnybox.moe`
2. Add new domain → `mail.bunnybox.moe`
3. Copy the 3 DNS records provided
4. Add them to Netlify DNS (with trailing period on MX!)
5. Update your code:
   ```typescript
   from: 'bunnybox <noreply@mail.bunnybox.moe>'
   ```

---

## 📧 Test Before Verification

You can test email sending WITHOUT domain verification using Resend's test domain:

```typescript
// In your lib/email.ts, temporarily change:
from: 'onboarding@resend.dev',  // Test domain (works immediately)
to: 'YOUR-EMAIL@gmail.com',     // Your email for testing
```

This lets you test the email system while waiting for DNS verification.

---

## 🆘 If Nothing Works

### 1. Take Screenshots

Capture screenshots of:
- Your Netlify DNS records page
- Your Resend domain configuration page
- The error message in Resend

### 2. Check Online DNS Tool

Visit: https://dns.email/?q=send.bunnybox.moe

Take a screenshot of the results.

### 3. Contact Resend Support

Email: support@resend.com
Include:
- Domain name: `send.bunnybox.moe`
- DNS provider: Netlify
- Screenshots from above
- What you've tried

### 4. Temporary Workaround

Use a different email service temporarily:
- Resend's test domain (`onboarding@resend.dev`)
- Or disable email verification in your app (not recommended for production)

---

## 📊 What Should DNS Records Look Like?

When you check https://dns.email/?q=send.bunnybox.moe, you should see:

### DKIM Record:
```
resend._domainkey.send.bunnybox.moe TXT
v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAA... (very long)
```

### SPF Record:
```
send.bunnybox.moe TXT
v=spf1 include:amazonses.com ~all
```

### MX Record:
```
send.bunnybox.moe MX
10 feedback-smtp.eu-west-1.amazonses.com
```

If these don't show up, the records aren't publicly visible yet.

---

## ⏰ Timeline

| Time | Action |
|------|--------|
| Now | Fix MX record trailing period |
| +5 min | Save changes in Netlify |
| +15 min | Check dns.email |
| +30 min | Click "Restart Verification" in Resend |
| +1 hour | Should be verified! |
| +24 hours | If still not working, contact support |

---

## 🎯 SUCCESS CRITERIA

You'll know it's working when:
- ✅ Resend domain status shows "Verified"
- ✅ dns.email shows all 3 records correctly
- ✅ You can send a test email successfully
- ✅ Email arrives in inbox (not spam)

---

**Start with the Quick Fix (adding trailing period to MX record) and work through the checklist!**
