# Automated Cleanup System

## Overview
The cleanup system automatically removes:
1. **Expired files** - Files past their `delete_at` timestamp
2. **Orphaned/failed uploads** - Files with no data (failed upload attempts)
3. **Inactive accounts** - Accounts with no activity for 6+ months (and their files)

## Components

### 1. Cleanup API Route
**Endpoint:** `/api/cleanup`
**Method:** POST
**Authentication:** Bearer token required

Performs all cleanup operations in one call.

### 2. Scheduled Function (Netlify)
**File:** `netlify/functions/scheduled-cleanup.ts`
**Schedule:** Daily at 2:00 AM UTC
**Cron:** `0 2 * * *`

Automatically calls the cleanup API daily.

### 3. Manual Cleanup Script
**File:** `scripts/manual-cleanup.ts`
**Usage:** `bun run cleanup`

Run anytime to manually trigger cleanup.

## Setup

### Local Development
```bash
# Add to .env.local
CLEANUP_API_KEY=your_random_secure_key_here

# Run manual cleanup
bun run cleanup
```

### Production (Netlify)
1. Add environment variable:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `CLEANUP_API_KEY` with a secure random value

2. The scheduled function will automatically run daily

## What Gets Cleaned

### Expired Files
- Files where `delete_at <= current_timestamp`
- Respects user-selected deletion times

### Orphaned/Failed Uploads
- Files with `file_data IS NULL`
- Files with empty `file_data`
- These occur when uploads fail after database insert

### Inactive Accounts
- Accounts where `last_activity` is older than 6 months
- All files associated with these accounts
- `last_activity` is updated on:
  - Sign in
  - File upload

## Upload Rollback Protection

The upload route now includes rollback logic:
- If anything fails after database insert, the file is automatically deleted
- Prevents orphaned records from failed uploads
- Uses `supabaseAdmin` to bypass RLS policies

## Manual Testing

### Test Cleanup Locally
```bash
# Make sure dev server is running
bun run dev

# In another terminal
bun run cleanup
```

### Test Cleanup in Production
```bash
# Using curl
curl -X POST https://bunbox.netlify.app/api/cleanup \
  -H "Authorization: Bearer YOUR_CLEANUP_API_KEY"
```

## Response Format

```json
{
  "success": true,
  "deletedFiles": 3,
  "deletedOrphanedFiles": 1,
  "deletedAccounts": 0,
  "timestamp": "2025-11-25T12:00:00.000Z"
}
```

## Security

- ✅ Cleanup API requires Bearer token authentication
- ✅ Uses `supabaseAdmin` to bypass RLS (necessary for cleanup)
- ✅ Token should be kept secret and stored in environment variables only
- ❌ Never commit `CLEANUP_API_KEY` to Git

## Monitoring

Check Netlify function logs to see cleanup results:
1. Go to Netlify Dashboard → Functions
2. Click on `scheduled-cleanup`
3. View execution logs

## Troubleshooting

### Cleanup not running
- Check that `CLEANUP_API_KEY` is set in Netlify environment variables
- Verify the scheduled function is deployed (check Netlify Functions dashboard)
- Check function logs for errors

### Manual cleanup fails
- Ensure dev server is running (`bun run dev`)
- Check that `CLEANUP_API_KEY` matches in `.env.local`
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### Files not being deleted
- Check Supabase RLS policies (admin client should bypass all)
- Verify `delete_at` timestamps are correct in database
- Check cleanup API logs for errors
