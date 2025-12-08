# User IP Address Tracking

## Overview

Track IP addresses for user accounts to enable IP-based moderation.

## Migration SQL

Add `ip_address` column to existing `users` table:

```sql
-- Add ip_address column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_ip_address ON users(ip_address);
```

## Usage

The IP address is automatically captured and stored when users:
- Sign up
- Sign in

This allows admins to:
- See which IP address a user is using
- Automatically pre-fill IP address in moderation dialogs
- Track multiple accounts from the same IP

## Privacy Note

IP addresses are stored for moderation purposes only and are not shared publicly.
