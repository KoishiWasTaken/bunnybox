# Storage Limits & Configuration Check

## The Good News: No File Bloating! ✅

**Your theory about file bloating is CORRECT for the old system, but NOT the new one!**

### Old Upload System (LEGACY - not used anymore)
```
45MB video → Base64 encoding → ~60MB in database ❌
```
Base64 encoding increases file size by ~33%, which could push files over 50MB.

### New Upload System (Current - Version 57+)
```
45MB video → Direct binary upload → 45MB in Supabase Storage ✅
```
**NO encoding, NO bloating!** The file stays exactly the same size.

## Check Your Bucket Configuration

The issue is likely **Supabase bucket limits**, not file bloating.

### Step 1: Check Bucket Config
Visit: **https://bunnybox.moe/api/diagnostics/bucket-config**

Look for these potential issues:

#### Issue A: File Size Limit Too Low
```json
{
  "bucket": {
    "fileSizeLimit": 52428800,  // 50MB - TOO LOW! ❌
  },
  "warnings": [
    "Bucket file size limit is configured incorrectly"
  ]
}
```

**Fix:**
1. Go to Supabase Dashboard > Storage > Buckets
2. Click on `files` bucket
3. Click "Edit bucket"
4. Set **File size limit** to `50` MB (or leave empty for unlimited)
5. Save

#### Issue B: Bucket Not Public
```json
{
  "bucket": {
    "isPublic": false  // ❌ Users can't access files!
  }
}
```

**Fix:**
1. Go to Supabase Dashboard > Storage > Buckets
2. Click on `files` bucket
3. Enable **Public bucket** toggle
4. Save

#### Issue C: MIME Type Restrictions
```json
{
  "bucket": {
    "allowedMimeTypes": ["image/*"]  // ❌ Videos not allowed!
  }
}
```

**Fix:**
1. Go to Supabase Dashboard > Storage > Buckets
2. Click on `files` bucket
3. Clear **Allowed MIME types** (leave empty to allow all)
4. Or add `video/*` to the list
5. Save

## Expected Configuration

**Perfect bucket config:**
```json
{
  "bucket": {
    "bucketId": "files",
    "isPublic": true,  ✅
    "fileSizeLimit": null,  ✅ (or 52428800 for 50MB)
    "allowedMimeTypes": null  ✅ (or empty array)
  },
  "tests": {
    "canCreateSignedUrl": true  ✅
  },
  "warnings": []  ✅
}
```

## Supabase Storage Limits by Tier

### Free Tier
- **Total storage:** 1GB
- **Bandwidth:** 2GB/month
- **Per-file limit:** No hard limit (practical limit ~5GB)
- **Bucket file size limit:** Configurable (default: unlimited)

### Pro Tier ($25/month)
- **Total storage:** 8GB (100GB with add-on)
- **Bandwidth:** 50GB/month
- **Per-file limit:** No hard limit (practical limit ~5GB)

## Check Your Storage Usage

1. Go to Supabase Dashboard
2. Click **Project Settings** > **Usage**
3. Check **Storage** usage

If you're at 1GB (free tier limit), you need to:
- Delete old files, or
- Upgrade to Pro tier

## Testing the Upload Flow

### Test 1: Small File (should always work)
```bash
# Create 1MB test file
dd if=/dev/zero of=test-1mb.bin bs=1M count=1

# Upload via bunnybox
# Should succeed ✅
```

### Test 2: Medium File (50MB)
```bash
# Create 50MB test file
dd if=/dev/zero of=test-50mb.bin bs=1M count=50

# Upload via bunnybox
# Should succeed ✅
```

### Test 3: Large File (45MB)
```bash
# Your actual MP4 file
# Should succeed if bucket configured correctly ✅
```

If Test 1 works but Test 3 fails → **Bucket file size limit is the issue**

## Quick Fix Commands

### Set Bucket File Size Limit to 50MB
Run this in Supabase SQL Editor:
```sql
-- This updates the bucket configuration
-- Note: You might need to do this via the Dashboard UI instead
UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50MB in bytes
WHERE id = 'files';
```

**Or use the Dashboard (recommended):**
1. Storage > Buckets > files > Edit
2. File size limit: `50` MB
3. Save

## Common Scenarios

### Scenario 1: 45MB upload fails, but 30MB works
**Diagnosis:** Bucket file size limit between 30-45MB
**Fix:** Increase bucket limit to 50MB

### Scenario 2: All uploads fail
**Diagnosis:** CORS, permissions, or bucket doesn't exist
**Fix:** Check `/api/diagnostics/storage` endpoint

### Scenario 3: Upload succeeds but file can't be accessed
**Diagnosis:** Bucket not public
**Fix:** Enable public bucket

### Scenario 4: Upload hangs at 90%
**Diagnosis:** Network timeout or slow connection
**Fix:** Wait longer (5min timeout) or use faster connection

## Next Steps

1. ✅ Check bucket config: `/api/diagnostics/bucket-config`
2. ✅ Check storage health: `/api/diagnostics/storage`
3. ✅ Fix any warnings shown
4. ✅ Try upload again with console open (F12)

The diagnostics will tell you EXACTLY what's wrong!
