# Netlify DNS Configuration for Resend (bunnybox.moe)

## 📍 Where to Configure

1. Go to: https://app.netlify.com
2. Select your site
3. Click "Domain management" or "Domains"
4. Click on "bunnybox.moe"
5. Click "DNS records" or "DNS panel"

---

## 🎯 Required DNS Records

You need to add **3 DNS records** to the `send` subdomain:

### Record #1: DKIM (TXT Record)

**In Netlify:**
```
Record type: TXT
Name: resend._domainkey.send
Value: [Copy EXACT value from Resend dashboard]
```

**Important:**
- Name should be JUST `resend._domainkey.send` (Netlify adds `.bunnybox.moe` automatically)
- DO NOT add quotes around the value
- Copy the ENTIRE value from Resend (it's very long, starts with `v=DKIM1`)

**Example:**
```
Name: resend._domainkey.send
Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
```

---

### Record #2: SPF (TXT Record)

**In Netlify:**
```
Record type: TXT
Name: send
Value: v=spf1 include:amazonses.com ~all
```

**Important:**
- Name is just `send` (not `send.bunnybox.moe`)
- Value is EXACTLY: `v=spf1 include:amazonses.com ~all`
- NO quotes

---

### Record #3: MX Record

**In Netlify:**
```
Record type: MX
Name: send
Priority: 10
Value: feedback-smtp.eu-west-1.amazonses.com.
```

**🚨 CRITICAL:**
- The value MUST end with a period (`.`)
- Without the period, Netlify will auto-append `.bunnybox.moe` and break verification
- The region (`eu-west-1`) should match what Resend shows (could be `us-east-1`, `ap-northeast-1`, etc.)

**Correct:**
```
feedback-smtp.eu-west-1.amazonses.com.
```

**Wrong:**
```
feedback-smtp.eu-west-1.amazonses.com  ❌ (missing period)
```

---

## 📸 Visual Guide

### What Your Netlify DNS Should Look Like:

```
Record type    | Name                        | Value                                              | Priority
---------------|-----------------------------|----------------------------------------------------|----------
TXT            | resend._domainkey.send      | v=DKIM1; k=rsa; p=MIIB...                        | -
TXT            | send                        | v=spf1 include:amazonses.com ~all                | -
MX             | send                        | feedback-smtp.eu-west-1.amazonses.com.           | 10
```

---

## ⚙️ Step-by-Step Configuration

### Step 1: Get Values from Resend

1. Go to: https://resend.com/domains
2. Click on your domain (or add `send.bunnybox.moe` if not added)
3. Copy the 3 DNS records shown

### Step 2: Add DKIM Record in Netlify

1. In Netlify DNS panel, click "Add new record"
2. Select "TXT" from dropdown
3. **Name:** `resend._domainkey.send`
4. **Value:** Paste the entire DKIM value from Resend (starts with `v=DKIM1`)
5. Click "Save"

### Step 3: Add SPF Record in Netlify

1. Click "Add new record"
2. Select "TXT" from dropdown
3. **Name:** `send`
4. **Value:** `v=spf1 include:amazonses.com ~all`
5. Click "Save"

### Step 4: Add MX Record in Netlify

1. Click "Add new record"
2. Select "MX" from dropdown
3. **Name:** `send`
4. **Priority:** `10`
5. **Value:** `feedback-smtp.eu-west-1.amazonses.com.` ← **TRAILING PERIOD!**
6. Click "Save"

### Step 5: Verify Configuration

1. Wait 15-30 minutes for DNS propagation
2. Check with: https://dns.email/?q=send.bunnybox.moe
3. Go to Resend → Click "Restart Verification"

---

## 🐛 Common Netlify Issues

### Issue: "Record already exists"

**Problem:** Netlify might already have a record with that name.

**Solution:**
1. Delete the existing record
2. Add the new one with correct values
3. Make sure there's only ONE record of each type for `send`

### Issue: MX Record Shows Wrong Value

**Problem:** After saving, the MX record shows `.bunnybox.moe` appended.

**Solution:**
1. Edit the MX record
2. Add a period (`.`) at the end of the value
3. Save again
4. Verify it doesn't have `.bunnybox.moe.bunnybox.moe`

### Issue: Can't Add Subdomain Records

**Problem:** Netlify won't let you add `send.bunnybox.moe` records.

**Solution:**
- Just use `send` as the Name (Netlify automatically appends `.bunnybox.moe`)
- Don't type the full `send.bunnybox.moe`

### Issue: DKIM Value Too Long

**Problem:** DKIM value gets truncated or has line breaks.

**Solution:**
1. Copy the value from Resend
2. Paste into a text editor first
3. Remove any line breaks (make it one continuous line)
4. Paste into Netlify
5. Netlify should accept long TXT records (up to 255 chars per string, multiple strings allowed)

---

## 🔍 How to Verify It's Working

### Method 1: Use DNS Checker
```
https://dns.email/?q=send.bunnybox.moe
```

Should show:
- ✅ DKIM record with long value
- ✅ SPF record with `v=spf1 include:amazonses.com ~all`
- ✅ MX record pointing to `feedback-smtp.[region].amazonses.com`

### Method 2: Use Command Line (if available)

```bash
# Check DKIM
dig TXT resend._domainkey.send.bunnybox.moe +short

# Check SPF
dig TXT send.bunnybox.moe +short

# Check MX
dig MX send.bunnybox.moe +short
```

### Method 3: Check Resend Dashboard

1. Go to: https://resend.com/domains
2. Find `send.bunnybox.moe`
3. Status should show: ✅ Verified

---

## 📋 Checklist Before Verification

- [ ] All 3 DNS records added in Netlify
- [ ] MX record has trailing period (`.`)
- [ ] No extra quotes around TXT values
- [ ] Waited at least 30 minutes
- [ ] Checked with dns.email tool
- [ ] Nameservers for bunnybox.moe point to Netlify
- [ ] No conflicting DNS records
- [ ] Clicked "Restart Verification" in Resend

---

## 🎯 Alternative: Use Root Domain

If `send.bunnybox.moe` continues to have issues, you can try the root domain:

### Option A: Use root domain directly

1. In Resend, remove `send.bunnybox.moe`
2. Add `bunnybox.moe` (root domain)
3. Add the DNS records without the `send` subdomain:
   - `resend._domainkey` instead of `resend._domainkey.send`
   - Root `@` instead of `send`

### Option B: Use different subdomain

1. Try `mail.bunnybox.moe` or `updates.bunnybox.moe`
2. Follow same DNS setup process
3. Update code to use new subdomain

---

## 💡 Pro Tips

1. **Always add trailing period to MX records** in Netlify
2. **Wait 30 minutes** before checking verification
3. **Use dns.email** to see exactly what's publicly visible
4. **Click "Restart Verification"** in Resend after DNS changes
5. **Check for conflicts** - make sure no other MX records exist for `send`

---

## 📞 Need Help?

If you're still stuck:

1. **Screenshot your Netlify DNS records**
2. **Screenshot your Resend domain config**
3. **Share the output from dns.email**
4. **Contact Resend support**: support@resend.com

Include:
- Domain: `send.bunnybox.moe`
- DNS provider: Netlify
- Screenshots
- Error messages

---

**Remember: The trailing period (`.`) on the MX record is the #1 fix for Netlify + Resend issues!**
