# Quick Fix: Large File Upload Failing

## Immediate Actions

### 1. Check Browser Console (MOST IMPORTANT)

**Steps:**
1. Open your browser (where the upload failed)
2. Press `F12` to open DevTools
3. Click on the **Console** tab
4. Try uploading a large file again
5. Look for error messages in RED

**What to look for:**
```
Starting upload: {filename: "20251210_113144.mp4", size: 68165800, sizeMB: "65.01MB", ...}
```

Then one of these errors:
- `Failed to get upload URL:` - Problem with step 1
- `Storage upload failed:` - Problem with step 2 (most likely)
- `Finalize upload failed:` - Problem with step 3

**Copy the full error message and share it!**

### 2. Check Supabase Storage Configuration

**Most Common Issue: Bucket Not Configured**

Go to: https://supabase.com/dashboard/project/puqcpwznfkpchfxhiglh/storage/buckets/files

**Check:**
- ✅ Bucket named `files` exists
- ✅ Public bucket: **ON**
- ✅ File size limit: **50 MB** or higher
- ✅ Allowed MIME types: Empty or includes `video/*`

**If bucket doesn't exist or is misconfigured:**
1. Create bucket named `files`
2. Set as public
3. Set file size limit to 50MB
4. Leave MIME types empty (allow all)

### 3. Check CORS Configuration

**In Supabase Dashboard:**
1. Go to Settings > API
2. Scroll to "CORS Configuration"
3. Ensure `https://bunnybox.moe` is in the allowed origins

**Required CORS headers:**
```
Access-Control-Allow-Origin: https://bunnybox.moe
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type, x-upsert
```

### 4. Test Storage Health

Visit: https://bunnybox.moe/api/diagnostics/storage

**Expected result:**
```json
{
  "healthy": true,
  "diagnostics": {
    "storage": {
      "configured": true,
      "bucketExists": true,
      "canCreateSignedUrl": true,
      "canListFiles": true
    }
  }
}
```

**If any check fails, that's the problem!**

### 5. Check Storage Quota

**In Supabase Dashboard:**
1. Go to Project Settings > Usage
2. Check Storage used vs. available
3. Free tier: 1GB total

**If storage is full:**
- Upgrade to Pro tier, or
- Delete old files from storage

## Most Likely Issues & Fixes

### Issue A: CORS Error in Console

**Error:**
```
Access to XMLHttpRequest at 'https://xxx.supabase.co/storage/v1/object/...'
from origin 'https://bunnybox.moe' has been blocked by CORS policy
```

**Fix:**
1. Go to Supabase Dashboard > Settings > API
2. Add `https://bunnybox.moe` to allowed origins
3. Try upload again

### Issue B: 403 Forbidden

**Error in console:**
```
Storage upload failed: {status: 403, statusText: "Forbidden", ...}
```

**Fix:**
1. Check bucket is **public** (most common)
2. Check RLS policies (see full troubleshooting guide)
3. Verify signed URL isn't expired

### Issue C: Upload Timeout

**Error in console:**
```
Upload timeout - file too large or connection too slow
```

**Fix:**
1. Check internet speed (need >2 Mbps upload for large files)
2. Try on faster connection
3. Or compress video file first

### Issue D: File Not Found in Storage

**Error in console:**
```
File upload was not completed. The file may not have finished uploading to storage.
```

**Fix:**
1. File didn't successfully upload to Supabase Storage
2. Check CORS (Issue A)
3. Check bucket permissions (Issue B)
4. Check storage quota (step 5 above)

## Quick Test

**Try a smaller file first:**
1. Upload a 5MB file
2. If it works → Issue is size-specific
3. If it fails → Issue is configuration

**Size-specific issues:**
- Storage quota reached
- Timeout on slow connection
- Browser memory limit

## What I Changed (Version TBD)

1. **Added detailed console logging:**
   - Shows upload start with file details
   - Shows specific errors at each step
   - Shows XHR status codes and responses

2. **Added 5-minute timeout:**
   - Files now have 300 seconds (5 min) to upload
   - Prevents hanging indefinitely
   - Shows timeout error if exceeded

3. **Added timeout error handling:**
   - Detects when upload times out
   - Provides helpful error message

4. **Created diagnostics endpoint:**
   - `/api/diagnostics/storage`
   - Checks storage configuration
   - Tests signed URL creation

5. **Improved error messages:**
   - More specific about which step failed
   - Includes error codes and details
   - Logs everything to console for debugging

## Next Steps

1. **Deploy these changes** to production
2. **Try the upload again** with browser console open (F12)
3. **Copy the error message** from console
4. **Check the diagnostics endpoint**
5. **Share the results**

Then we can pinpoint the exact issue and fix it!

## Deploy Command

```bash
cd bunnybox
git add -A
git commit -m "Add upload diagnostics and better error handling"
git push origin main
```

Wait ~2-3 minutes for Netlify auto-deploy.

Then test at: https://bunnybox.moe
