# 🚨 QUICK START: Fix Your DNS Issue NOW

## TL;DR - What You Need to Do

**99% of the time, this is caused by a missing period (`.`) in your MX record.**

---

## ⚡ 2-Minute Fix

### 1. Go to Netlify DNS Settings

https://app.netlify.com → Your site → Domain management → bunnybox.moe → DNS records

### 2. Find Your MX Record

Look for the MX record with name `send` or `send.bunnybox.moe`

### 3. Edit the MX Record

**Change this:**
```
feedback-smtp.eu-west-1.amazonses.com
```

**To this:**
```
feedback-smtp.eu-west-1.amazonses.com.
```
☝️ **Add a period (`.`) at the end!**

### 4. Wait and Verify

1. Save the change in Netlify
2. Wait 15-30 minutes
3. Go to https://resend.com/domains
4. Click "Restart Verification"

**That's it!** This fixes 99% of Netlify + Resend DNS issues.

---

## 🔍 Check If It's Working

### Online Checker
Visit: **https://dns.email/?q=send.bunnybox.moe**

You should see:
- ✅ DKIM record (very long, starts with `v=DKIM1`)
- ✅ SPF record (`v=spf1 include:amazonses.com ~all`)
- ✅ MX record (points to `feedback-smtp.[region].amazonses.com`)

If you DON'T see these records, they haven't propagated yet. Wait 30 minutes and check again.

---

## 📚 Full Guides Available

If the quick fix doesn't work, see:

1. **RESEND-FIX-STEPS.md** - Detailed troubleshooting steps
2. **NETLIFY-DNS-GUIDE.md** - Complete Netlify configuration guide
3. **DNS-TROUBLESHOOTING.md** - Advanced diagnostics
4. **EMAIL-SETUP.md** - Original email setup guide

---

## ❓ Not Using Netlify?

If your DNS is managed elsewhere (Cloudflare, GoDaddy, etc.):
1. Find where your nameservers point: https://dns.email/?q=bunnybox.moe
2. Add DNS records at that provider
3. Follow Resend's DNS guide for your specific provider

---

## 🧪 Test Without Waiting for Verification

Want to test email sending while waiting for DNS verification?

Temporarily use Resend's test domain in your code:

```typescript
// In bunnybox/src/lib/email.ts, change line 32:
from: 'onboarding@resend.dev',  // Works immediately, no verification needed
```

Send a test email to yourself. Once DNS verification completes, change it back to:

```typescript
from: 'bunnybox <noreply@bunnybox.moe>',
```

---

## 📊 What DNS Records Should Look Like in Netlify

| Type | Name | Value | Priority |
|------|------|-------|----------|
| TXT | `resend._domainkey.send` | `v=DKIM1; k=rsa; p=MIIB...` (very long) | - |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | - |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com.` | 10 |

**Note:** The region in the MX record (`eu-west-1`) should match what Resend shows.

---

## ⏰ Expected Timeline

| Time | What Happens |
|------|--------------|
| Now | Fix MX record (add trailing period) |
| +15 min | DNS starts propagating |
| +30 min | Check dns.email, click "Restart Verification" |
| +1 hour | Should be verified! ✅ |
| +24 hours | If still not working, see full troubleshooting guide |

---

## 🆘 Still Stuck?

1. **Double-check** the MX record has a period (`.`) at the end
2. **Wait** at least 30 minutes after making changes
3. **Check** https://dns.email/?q=send.bunnybox.moe
4. **Click** "Restart Verification" in Resend dashboard
5. **Read** RESEND-FIX-STEPS.md for detailed troubleshooting

---

## ✅ Success Checklist

- [ ] MX record ends with period (`.`)
- [ ] All 3 DNS records added (DKIM, SPF, MX)
- [ ] Waited 30+ minutes
- [ ] Checked with dns.email
- [ ] Clicked "Restart Verification" in Resend
- [ ] Domain shows "Verified" in Resend dashboard

---

**Start with the 2-minute fix above!** 95% of the time, that's all you need. 🎯
