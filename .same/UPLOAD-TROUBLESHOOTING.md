# Upload Troubleshooting Guide

**Issue:** Large file upload troubleshooting

## Diagnostic Steps

### 1. Check Storage Health

Visit the diagnostics endpoint:
```
https://bunnybox.moe/api/diagnostics/storage
```

This will show:
- ✅ Supabase connection status
- ✅ Storage bucket existence
- ✅ Ability to create signed URLs
- ✅ Ability to list files

**Expected result:** All checks should pass with `"healthy": true`

### 2. Check Browser Console

Open browser DevTools (F12) and look for error messages during upload:
- Click on the Console tab
- Attempt to upload a large file
- Look for errors in red

**Common errors:**
- `Upload failed (403)` - CORS or permissions issue
- `Upload failed (413)` - File too large
- `Network error during upload` - Connection timeout
- `Upload timeout` - File taking too long (>5 minutes)
- `File upload was not completed` - File didn't reach storage

### 3. Check Supabase Storage Configuration

**Bucket Setup:**
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/puqcpwznfkpchfxhiglh/storage
2. Verify the `files` bucket exists
3. Check bucket settings:
   - **Public bucket:** Should be ON (for public access)
   - **File size limit:** Should be at least 50MB
   - **Allowed MIME types:** Should be empty or include `video/mp4`

**CORS Configuration:**
1. In Supabase Dashboard, go to Storage > Configuration
2. Ensure CORS is configured to allow uploads from `https://bunnybox.moe`
3. Required CORS headers:
   ```
   Access-Control-Allow-Origin: https://bunnybox.moe
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Content-Type, x-upsert
   ```

### 4. Check RLS Policies

Run this query in Supabase SQL Editor to verify policies:

```sql
SELECT * FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';
```

**Expected policies:**
- ✅ "Public Access" - SELECT on bucket_id = 'files'
- ✅ "Service Role Upload" - INSERT on bucket_id = 'files'
- ✅ "Service Role Delete" - DELETE on bucket_id = 'files'
- ✅ "Service Role Update" - UPDATE on bucket_id = 'files'

If policies are missing, run:
```sql
-- See .same/migrations/setup_storage_policies.sql
```

### 5. Test with Smaller File

Try uploading progressively larger files:
- ✅ 1MB file
- ✅ 10MB file
- ✅ 25MB file
- ✅ 50MB file
- ❌ 45MB file

This helps identify if it's a size-specific issue.

### 6. Check Network Tab

1. Open DevTools > Network tab
2. Upload the file
3. Look for the upload request to Supabase Storage
4. Check:
   - Request size
   - Response status code
   - Response body
   - Time to complete

### 7. Verify Environment Variables

Check Netlify environment variables:
1. Go to Netlify Dashboard > Site settings > Environment variables
2. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Common Issues & Solutions

### Issue: "Upload failed (403): Forbidden"

**Cause:** CORS or bucket permissions issue

**Solution:**
1. Check bucket is public
2. Verify CORS configuration in Supabase
3. Ensure RLS policies allow uploads

### Issue: "Upload timeout"

**Cause:** File taking >5 minutes to upload

**Solution:**
1. Check internet connection speed
2. Try uploading on a faster connection
3. Compress the video file
4. Increase timeout in `src/app/page.tsx` (currently 300000ms = 5min)

### Issue: "File upload was not completed"

**Cause:** File didn't successfully upload to Supabase Storage

**Solution:**
1. Check storage bucket exists
2. Verify signed URL is valid
3. Check for CORS errors in console
4. Ensure bucket has space/quota

### Issue: "Failed to save file metadata"

**Cause:** Database insert failed after successful storage upload

**Solution:**
1. Check database schema has required columns
2. Verify `storage_path` and `uses_storage` columns exist
3. Check database RLS policies
4. Look at error logs in admin panel

## Supabase Storage Limits

**Free Tier:**
- Storage: 1GB
- Bandwidth: 2GB/month
- File size: No hard limit, but practical limit ~5GB

**Pro Tier:**
- Storage: 8GB
- Bandwidth: 50GB/month
- File size: No hard limit, practical limit ~5GB

Check your current usage:
1. Supabase Dashboard > Project Settings > Usage
2. Look at Storage usage

## Testing Commands

### Test upload URL generation
```bash
curl -X POST https://bunnybox.moe/api/files/get-upload-url \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.mp4","contentType":"video/mp4"}'
```

### Test storage health
```bash
curl https://bunnybox.moe/api/diagnostics/storage
```

## Next Steps

If none of the above solutions work:

1. **Check Netlify Logs:**
   - Go to Netlify Dashboard > Functions
   - Look for errors in function logs
   - Check for timeout errors

2. **Check Error Logs:**
   - Sign in as admin (@koishi)
   - Go to Admin Panel > Errors tab
   - Look for recent upload errors

3. **Monitor in Real-Time:**
   - Keep browser console open
   - Keep Network tab open
   - Attempt upload
   - Note exact error message and step where it fails

4. **Try Different Browser:**
   - Test in Chrome, Firefox, Safari
   - Some browsers handle large uploads differently

5. **Contact Support:**
   - Email: support@bunnybox.moe
   - Discord: @.koishi
   - Include: File size, browser, error message, console logs

## Recent Changes

**Version 57 (Nov 27, 2025):**
- Migrated to Supabase Storage for uploads
- Implemented 3-step upload process
- Supports files up to 50MB (validation limit)
- Direct browser-to-storage upload

**Upload Flow:**
1. Client requests signed upload URL (`/api/files/get-upload-url`)
2. Client uploads directly to Supabase Storage (XHR with progress)
3. Client finalizes upload (`/api/files/finalize-upload`)

This bypasses Netlify function limits and supports much larger files.
