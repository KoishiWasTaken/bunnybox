# Version 18 - Major Feature Updates

## Deployment
- **Live URL:** https://bunbox.netlify.app
- **Version:** 18
- **Date:** November 25, 2025

## New Features

### 1. Audio File Preview
- Added support for previewing audio files directly in the browser
- Supported formats: mp3, wav, ogg, flac, m4a, aac, wma, opus, webm
- Native HTML5 audio player with controls
- Location: File download page (`/f/{id}`)

### 2. Dashboard Redesign
- Changed from card-based layout to compact table view
- Shows 10 files per page with pagination
- Columns: Filename, Size, Uploaded Date, Visitors, Downloads, Expires, Actions
- Smaller action buttons for cleaner UI
- Better for users with many uploaded files
- Mobile responsive table

### 3. Updated Rate Limiting System
**New Limits:**
- 100 uploads per 24 hours (previously 10 per 10 minutes)

**Escalating Ban System:**
1. **First Violation:** 1-week temporary ban
2. **Second Violation:** Permanent IP ban
   - IP address permanently blocked from uploading
   - Cannot create new accounts
   - Associated account and files remain (manual cleanup needed)

**Database Changes:**
- Added `permanent_ban` (boolean) to rate_limits table
- Added `ban_count` (integer) to rate_limits table
- Tracks number of violations for each IP address

### 4. Account Inactivity Deletion
**Policy:**
- Accounts inactive for 6 months are automatically deleted
- Inactivity = no uploads AND no sign-ins for 6 months
- All files associated with inactive accounts are also deleted

**Implementation:**
- Added `last_activity` (timestamp) to users table
- Updated on sign-in and file upload
- Cleanup performed via API route (see below)

### 5. Cleanup API Route
**Endpoint:** `/api/cleanup`
**Method:** POST
**Authentication:** Bearer token required

**What it does:**
1. Deletes expired files (files past their delete_at timestamp)
2. Deletes inactive accounts (no activity for 6 months)
3. Deletes files associated with deleted accounts

**Usage:**
```bash
curl -X POST https://bunbox.netlify.app/api/cleanup \
  -H "Authorization: Bearer YOUR_CLEANUP_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "deletedFiles": 5,
  "deletedAccounts": 2,
  "timestamp": "2025-11-25T12:00:00.000Z"
}
```

**Setup:**
- Add `CLEANUP_API_KEY` to environment variables (Netlify)
- Recommended to run daily via cron job or scheduled function

**Netlify Scheduled Function (Optional):**
Create `netlify/functions/scheduled-cleanup.ts`:
```typescript
import { schedule } from "@netlify/functions";

const handler = async (event) => {
  const response = await fetch(`${process.env.URL}/api/cleanup`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLEANUP_API_KEY}`
    }
  });

  const data = await response.json();
  console.log('Cleanup completed:', data);

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};

export default schedule("0 2 * * *", handler); // Runs daily at 2 AM
```

### 6. Updated Documentation
- FAQ page updated with new rate limit policy
- FAQ page includes account inactivity policy
- Legal page (Terms of Service) updated with:
  - New rate limiting section (section 6)
  - Account inactivity policy (section 5)
  - Renumbered subsequent sections

## Database Schema Changes

### Users Table
```sql
ALTER TABLE users ADD COLUMN last_activity timestamp with time zone DEFAULT now();
```

### Rate Limits Table
```sql
ALTER TABLE rate_limits ADD COLUMN permanent_ban boolean NOT NULL DEFAULT false;
ALTER TABLE rate_limits ADD COLUMN ban_count integer NOT NULL DEFAULT 0;
```

## Testing Recommendations

1. **Audio Preview:**
   - Upload an MP3 file and verify preview works
   - Test with different audio formats

2. **Dashboard:**
   - Create a test account with 15+ files
   - Verify pagination works correctly
   - Test all action buttons (View, Copy, Delete)

3. **Rate Limiting:**
   - Would require 100+ uploads to test first ban
   - Verify ban_count increments properly in database

4. **Cleanup API:**
   - Test manually with curl/Postman
   - Verify expired files are deleted
   - Check that 6-month-old accounts are deleted

## Future Enhancements

1. Email notifications before account deletion
2. Admin dashboard to manage bans
3. Ability to appeal permanent bans
4. File compression for audio files
5. Playlist support for multiple audio files
6. Video file preview support

## Notes

- All existing users and files are compatible with version 18
- Database migrations completed successfully
- 2 existing users have last_activity set to their created_at date
- 6 existing rate_limit records updated with new fields
- No breaking changes to existing functionality
