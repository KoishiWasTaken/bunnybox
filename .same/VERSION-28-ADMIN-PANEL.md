# Version 28 - Admin Panel & User Moderation

## Overview

Added a comprehensive admin panel system for moderating users and files, with IP-based ban system.

## Features

### Admin Panel (`/admin/panel`)
- **User Management**: View all users with their file counts and activity
- **File Management**: View all files with moderation controls
- **Moderation Tools**: Ban users temporarily or permanently by IP address

### Access Control
- Only the user "koishi" has admin access
- Admin Panel link appears in navigation when logged in as koishi
- Admin Panel button appears in dashboard for admin users
- All admin API routes require authentication

### User Moderation
When moderating a user, admins can:
- **Temporary Ban**: Ban for a custom number of hours
- **Permanent Ban**: Permanently ban the IP address
- **Ban Reason**: Add a custom reason that will be shown to the banned user
- **IP-Based**: Bans are tied to IP addresses, not just accounts

### File Moderation
- View all uploaded files with details
- Delete any file instantly
- Files are permanently removed from database

### Ban System
- IP addresses can be temporarily or permanently banned
- Banned users see a notification dialog on next visit
- Upload attempts are blocked with reason displayed
- Temporary bans automatically expire
- Ban reasons are shown to users

## Database Schema

### New Table: `ip_bans`

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
```

## Setup Required

### 1. Create ip_bans Table

Run this SQL in Supabase Dashboard → SQL Editor:

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

### 2. That's it!

The admin panel is ready to use.

## API Routes

### `/api/admin/users` (GET)
- Returns list of all users with file counts
- Requires x-username header (admin only)

### `/api/admin/files` (GET, DELETE)
- GET: Returns list of all files
- DELETE: Deletes a file by ID
- Requires x-username header (admin only)

### `/api/admin/ban` (PUT)
- Bans an IP address
- Body: `{ ipAddress, durationHours, reason, isPermanent }`
- Requires x-username header (admin only)

### `/api/ban-status` (GET)
- Checks if current IP is banned
- Returns ban details if banned
- Public route (used on homepage)

## Usage

### Accessing Admin Panel

1. Sign in as "koishi"
2. Click "Admin Panel" in the navigation bar
3. Or click "Admin Panel" button in dashboard

### Moderating a User

1. Go to Admin Panel
2. Find the user in the Users table
3. Click "Moderate" button
4. Enter the user's IP address (check server logs or rate_limits table)
5. Choose temporary or permanent ban
6. Set duration (if temporary)
7. Add ban reason
8. Click "Temporary Ban" or "Permanent Ban"

### Deleting a File

1. Go to Admin Panel
2. Find the file in the Files table
3. Click "Delete" button
4. Confirm deletion

### How Bans Work

1. Admin bans an IP address with a reason
2. Next time that IP visits the site, they see a dialog:
   - "You have been [temporarily banned for X hours / permanently banned]"
   - "Reason: {reason}"
3. Upload attempts are blocked with error message
4. Temporary bans automatically expire after duration
5. Permanent bans never expire

## UI Components

### Admin Panel Page
- Two main sections: Users and Files
- Tables with sortable data
- Action buttons for each item
- Orange color scheme to distinguish from regular UI

### Moderation Dialog
- IP address input (required)
- Permanent ban checkbox
- Duration input (hours, if not permanent)
- Reason textarea
- Cancel and Ban buttons

### Ban Notification Dialog
- Shows ban status (temporary/permanent)
- Shows remaining time (if temporary)
- Shows ban reason
- "I Understand" button to close

## Navigation Updates

- Admin Panel link appears to the right of "Legal"
- Orange color to indicate admin functionality
- Only visible when signed in as koishi

## Dashboard Updates

- Admin Panel button appears next to "Upload New File"
- Only visible when signed in as koishi
- Orange color scheme

## Security

- All admin routes check username === 'koishi'
- RLS policies prevent public access to ip_bans table
- Service role required for ban management
- IP addresses stored for moderation purposes

## Files Created/Modified

### New Files
- `src/app/admin/panel/page.tsx` - Admin panel UI
- `src/app/api/admin/users/route.ts` - User management API
- `src/app/api/admin/files/route.ts` - File management API
- `src/app/api/admin/ban/route.ts` - Ban management API
- `src/app/api/ban-status/route.ts` - Ban status check API
- `.same/database-schema-bans.md` - Database schema documentation
- `.same/VERSION-28-ADMIN-PANEL.md` - This file

### Modified Files
- `src/components/Navigation.tsx` - Added Admin Panel link
- `src/app/dashboard/page.tsx` - Added Admin Panel button
- `src/app/page.tsx` - Added ban notification dialog
- `src/app/api/files/upload/route.ts` - Added ban checking

## Testing

### Test Ban System

1. Sign in as koishi
2. Go to Admin Panel
3. Ban an IP (e.g., 127.0.0.1) with reason "Testing"
4. Visit homepage from that IP
5. Should see ban notification dialog
6. Try to upload a file
7. Should be blocked with error message

### Test File Deletion

1. Upload a file
2. Go to Admin Panel
3. Find the file and click Delete
4. File should be removed from list and database

## Next Steps

1. Run the SQL migration to create ip_bans table
2. Test the admin panel as koishi
3. Test moderation features
4. Deploy to production

---

**Status**: Version 28 complete, ready to test!
**Not deployed yet** - waiting for your explicit request.
