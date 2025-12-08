#!/bin/bash

# DNS Verification Checker for bunnybox.moe
# Run this script to diagnose Resend DNS issues

echo "🔍 Checking DNS Records for bunnybox.moe..."
echo "================================================"
echo ""

echo "1️⃣ Checking DKIM Record (resend._domainkey.send.bunnybox.moe):"
echo "------------------------------------------------"
nslookup -type=TXT resend._domainkey.send.bunnybox.moe 8.8.8.8
echo ""
echo ""

echo "2️⃣ Checking SPF TXT Record (send.bunnybox.moe):"
echo "------------------------------------------------"
nslookup -type=TXT send.bunnybox.moe 8.8.8.8
echo ""
echo ""

echo "3️⃣ Checking MX Record (send.bunnybox.moe):"
echo "------------------------------------------------"
nslookup -type=MX send.bunnybox.moe 8.8.8.8
echo ""
echo ""

echo "4️⃣ Checking Nameservers (bunnybox.moe):"
echo "------------------------------------------------"
nslookup -type=NS bunnybox.moe 8.8.8.8
echo ""
echo ""

echo "✅ DNS Check Complete!"
echo ""
echo "📝 What to check:"
echo "   - DKIM record should exist and be very long (starts with 'v=DKIM1')"
echo "   - SPF record should be 'v=spf1 include:amazonses.com ~all'"
echo "   - MX record should point to feedback-smtp.[region].amazonses.com"
echo "   - Nameservers should be Netlify's if using Netlify DNS"
echo ""
echo "🌐 Online checker: https://dns.email/?q=bunnybox.moe"
echo "📚 Troubleshooting guide: .same/DNS-TROUBLESHOOTING.md"
