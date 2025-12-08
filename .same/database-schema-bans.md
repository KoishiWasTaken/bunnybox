# IP Bans Table Schema

## Overview

This table stores IP address bans for moderation purposes.

## Table: ip_bans

```sql
CREATE TABLE ip_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banned_until TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false,
  reason TEXT,
  banned_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ip_bans_ip_address ON ip_bans(ip_address);
CREATE INDEX idx_ip_bans_banned_until ON ip_bans(banned_until);
```

## Migration SQL

Run this in Supabase Dashboard → SQL Editor:

```sql
-- Create ip_bans table
CREATE TABLE ip_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banned_until TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false,
  reason TEXT,
  banned_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ip_bans_ip_address ON ip_bans(ip_address);
CREATE INDEX idx_ip_bans_banned_until ON ip_bans(banned_until);

-- Enable RLS
ALTER TABLE ip_bans ENABLE ROW LEVEL SECURITY;

-- Service role can manage all bans
CREATE POLICY "Service role can manage ip bans"
ON ip_bans FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- No public access
CREATE POLICY "No public access to ip bans"
ON ip_bans FOR ALL TO anon
USING (false) WITH CHECK (false);
```

## Fields

- **id**: Unique identifier
- **ip_address**: IP address that is banned
- **banned_at**: When the ban was issued
- **banned_until**: When the ban expires (NULL for permanent)
- **is_permanent**: Whether the ban is permanent
- **reason**: Reason for the ban (shown to user)
- **banned_by**: Username of admin who issued the ban
- **created_at**: Record creation time

## Usage

### Check if IP is banned

```typescript
const { data: ban } = await supabase
  .from('ip_bans')
  .select('*')
  .eq('ip_address', ipAddress)
  .single();

if (ban) {
  if (ban.is_permanent) {
    // Permanently banned
  } else if (ban.banned_until && new Date(ban.banned_until) > new Date()) {
    // Temporarily banned
  }
}
```

### Issue a ban

```typescript
await supabaseAdmin
  .from('ip_bans')
  .upsert({
    ip_address: '192.168.1.1',
    banned_until: '2025-12-31T23:59:59Z', // or null for permanent
    is_permanent: false,
    reason: 'Spam uploads',
    banned_by: 'koishi',
  });
```
