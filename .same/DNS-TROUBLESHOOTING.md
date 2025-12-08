# DNS Troubleshooting Guide for Resend + Netlify

## Current Issue
Resend is failing to verify DNS records for bunnybox.moe, even though records have been added via Netlify.

## Quick Diagnosis Steps

### 1. Check DNS Records Online
Visit: https://dns.email/?q=bunnybox.moe

This will show you what DNS records are publicly visible. Compare them to what Resend shows in your dashboard.

### 2. Check DNS Records in Terminal
Run these commands to verify your DNS records:

```bash
# Check DKIM (most common issue)
nslookup -type=TXT resend._domainkey.send.bunnybox.moe

# Check SPF TXT record
nslookup -type=TXT send.bunnybox.moe

# Check MX record
nslookup -type=MX send.bunnybox.moe
```

## Common Issues and Solutions

### ⚠️ Issue #1: Netlify Auto-Appending Domain Names

**Problem:** Netlify automatically appends your domain to MX record values, causing:
- `feedback-smtp.eu-west-1.amazonses.com` becomes
- `feedback-smtp.eu-west-1.amazonses.com.bunnybox.moe` ❌

**Solution:** Add a trailing period (dot) at the end of the MX record value in Netlify:
```
feedback-smtp.eu-west-1.amazonses.com.
```
The trailing period tells Netlify this is a fully qualified domain name.

### ⚠️ Issue #2: Wrong Subdomain

**Problem:** Records added to root domain instead of `send` subdomain.

**Solution:** Make sure all Resend DNS records are added to the `send` subdomain:
- DKIM: `resend._domainkey.send.bunnybox.moe`
- SPF TXT: `send.bunnybox.moe`
- MX: `send.bunnybox.moe`

NOT the root domain `bunnybox.moe`!

### ⚠️ Issue #3: Nameserver Conflicts

**Problem:** DNS managed in multiple places (Netlify, domain registrar, Cloudflare, etc.)

**Solution:**
1. Check where your nameservers point:
   ```bash
   nslookup -type=NS bunnybox.moe
   ```
2. Add DNS records ONLY at the provider that controls your nameservers
3. If using Netlify DNS, nameservers should be Netlify's

### ⚠️ Issue #4: Incomplete DKIM Record

**Problem:** DKIM record value is very long and might be truncated or have extra quotes.

**Solution:**
- Copy the EXACT value from Resend dashboard
- Remove any extra quotes that Netlify might add
- Ensure the entire value is copied (no truncation)

### ⚠️ Issue #5: DNS Propagation Time

**Problem:** Records added correctly but not propagated yet.

**Solution:**
- DNS changes can take up to 72 hours (usually 15 minutes - 24 hours)
- Click "Restart Verification" in Resend dashboard after adding records
- Use https://dns.email to check if records are publicly visible

## Step-by-Step Fix for Netlify

### 1. Go to Netlify DNS Settings
1. Log in to Netlify
2. Go to your site → Domain management → DNS records
3. Find bunnybox.moe domain

### 2. Verify Record Format
For each Resend record, check:

**DKIM Record:**
- Type: `TXT`
- Name: `resend._domainkey.send`
- Value: `[exact value from Resend, no extra quotes]`

**SPF TXT Record:**
- Type: `TXT`
- Name: `send`
- Value: `v=spf1 include:amazonses.com ~all`

**MX Record:**
- Type: `MX`
- Name: `send`
- Value: `feedback-smtp.eu-west-1.amazonses.com.` ← **Note the trailing dot!**
- Priority: `10`

### 3. Add Trailing Periods
For MX and any CNAME records, add a trailing period:
```
feedback-smtp.eu-west-1.amazonses.com.
```

This prevents Netlify from appending `.bunnybox.moe` to the end.

### 4. Wait and Verify
1. Save changes in Netlify
2. Wait 15-30 minutes
3. Check with: https://dns.email/?q=bunnybox.moe
4. Click "Restart Verification" in Resend dashboard

## Verification Checklist

- [ ] All 3 DNS records added (DKIM, SPF TXT, MX)
- [ ] Records added to `send` subdomain (not root)
- [ ] MX record has trailing period (`.`)
- [ ] DKIM value matches Resend exactly
- [ ] Nameservers point to Netlify
- [ ] Waited at least 30 minutes after adding records
- [ ] Clicked "Restart Verification" in Resend
- [ ] Checked records with dns.email

## Alternative: Use Subdomain Instead of send.bunnybox.moe

If you're having persistent issues, try using a different subdomain:

1. In Resend, remove the current domain
2. Add a new domain: `mail.bunnybox.moe` or `updates.bunnybox.moe`
3. Follow the same DNS setup steps
4. Update your email sending domain in the code:
   ```typescript
   from: 'bunnybox <noreply@mail.bunnybox.moe>'
   ```

## What Region Are You In?

Check your MX record to see which AWS region Resend is using:
- `us-east-1` - US East
- `eu-west-1` - Europe
- `ap-northeast-1` - Asia Pacific
- `sa-east-1` - South America

Your MX record should match the region shown in Resend dashboard.

## Still Not Working?

If you've tried everything:

1. **Take screenshots** of:
   - Your Netlify DNS records
   - Your Resend domain configuration page
   - Output from `nslookup` commands

2. **Contact Resend Support**: https://resend.com/help
   - Provide your domain name
   - Share the screenshots
   - Explain what you've tried

3. **Alternative**: Use testing domain
   - For testing, you can send from `onboarding@resend.dev`
   - This doesn't require domain verification
   - Only for testing purposes (not production)

## Testing Without Verification

While waiting for DNS verification, you can still test emails using Resend's test domain:

```typescript
await resend.emails.send({
  from: 'onboarding@resend.dev', // Test domain
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<p>Testing Resend</p>',
});
```

This will work immediately without domain verification.

## Resources

- **DNS Checker**: https://dns.email
- **Resend Dashboard**: https://resend.com/domains
- **Resend Support**: https://resend.com/help
- **Resend Troubleshooting**: https://resend.com/docs/knowledge-base/what-if-my-domain-is-not-verifying
- **Netlify DNS Docs**: https://docs.netlify.com/domains-https/netlify-dns/

---

**Next Steps**: Follow the checklist above and report back with the output from the `nslookup` commands!
