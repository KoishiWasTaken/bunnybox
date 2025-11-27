# Large File Upload Issue - main.mp4 (41.84MB)

## Issue Summary

**Date:** November 26, 2025
**File:** main.mp4
**Size:** 41.84 MB
**Error:** "Server returned an invalid response"

## Root Cause

The upload failed due to **Netlify function limitations**:

### Netlify Free Tier Limits:
- **Function timeout:** 10 seconds
- **Payload size:** 6MB (for request body)
- **Memory:** 1024MB

### What Happens During Upload:
1. **File upload to Netlify:** 2-5 seconds (depending on connection)
2. **Base64 conversion:** 41.84MB → ~55.8MB (~2-3 seconds)
3. **Database insertion:** Large payload (~1-2 seconds)
4. **Total time:** ~5-10 seconds (borderline timeout)

For files around 40MB+, the process can exceed the 10-second timeout, causing:
- HTTP 502 Bad Gateway or 504 Gateway Timeout
- HTML error page (not JSON) returned
- Client sees "Server returned an invalid response"

## Why No Error Was Logged

The error occurred at the **Netlify infrastructure level** before our application code could handle it, so it wasn't logged to the database.

## Immediate Solution for Users

### Option 1: Compress the Video
Use a video compressor to reduce file size to under 30MB:

**Tools:**
- **HandBrake** (free, desktop): https://handbrake.fr/
- **FFmpeg** (command line):
  ```bash
  ffmpeg -i main.mp4 -vcodec h264 -crf 28 main_compressed.mp4
  ```
- **Online tools:**
  - https://www.freeconvert.com/video-compressor
  - https://www.videosmaller.com/

**Recommended settings:**
- Codec: H.264
- Quality: 24-28 CRF (lower = better quality, larger file)
- Resolution: Keep original or scale down if acceptable
- Target size: < 30MB

### Option 2: Split the File
If you need the original quality, split into parts:
```bash
# Split into 20MB chunks
ffmpeg -i main.mp4 -c copy -map 0 -segment_time 00:01:00 -f segment main_part%03d.mp4
```

Upload each part separately.

## Long-Term Solutions

### Solution 1: Direct Supabase Storage Upload (RECOMMENDED)

**Implementation:**
- Upload files directly to Supabase Storage (bypasses Netlify functions)
- Store only metadata in database
- Use Supabase CDN for file delivery

**Benefits:**
- ✅ Supports files up to **5GB** (Supabase limit)
- ✅ Faster uploads (direct to storage, no API route)
- ✅ Better performance (CDN delivery)
- ✅ No timeout issues
- ✅ Lower server costs (less function execution time)

**Implementation estimate:** 2-4 hours

### Solution 2: Chunked Upload Client-Side

**Implementation:**
- Split files into smaller chunks (5MB each) on client
- Upload chunks sequentially via API
- Reassemble on server or during download

**Benefits:**
- ✅ Supports very large files (100MB+)
- ✅ Resumable uploads (can retry failed chunks)
- ✅ Progress tracking per chunk
- ✅ Works within Netlify limits

**Drawbacks:**
- ⚠️ More complex implementation
- ⚠️ Slower (multiple API calls)
- ⚠️ Requires chunk reassembly logic

**Implementation estimate:** 4-6 hours

### Solution 3: Upgrade to Netlify Pro

**Cost:** $19/month

**What changes:**
- Function timeout: 10s → **26 seconds**
- Background functions: **15 minutes**
- Higher payload limits

**Benefits:**
- ✅ Simple (no code changes needed)
- ✅ Supports files up to ~60-70MB
- ✅ Other Pro features (analytics, etc.)

**Drawbacks:**
- ⚠️ Monthly cost
- ⚠️ Still has limits (not a complete solution)

### Solution 4: Lower File Size Limit

**Implementation:**
- Change max file size from 100MB to 30MB
- Update validation and UI
- Add clear warning about size limits

**Benefits:**
- ✅ Quick fix (5 minutes)
- ✅ Prevents user frustration
- ✅ Sets proper expectations

**Drawbacks:**
- ⚠️ Reduces functionality
- ⚠️ Doesn't solve the problem, just avoids it

## Recommended Implementation Plan

**Phase 1: Quick Fix (Now)**
1. ✅ Add better error messages (DONE)
2. ✅ Add warnings for large files (DONE)
3. Update FAQ with size recommendations
4. Consider temporary 30MB limit

**Phase 2: Proper Solution (Next Sprint)**
1. Implement Supabase Storage upload
2. Migrate existing files (optional)
3. Update documentation
4. Increase file size limit to 500MB or 1GB

## Changes Made

### 1. Better Error Handling (`src/app/page.tsx`)
```typescript
// Now detects timeout errors (502/504) and provides helpful message
if (response.status === 502 || response.status === 504) {
  throw new Error(
    `Upload timed out. Your file (${fileSizeInMB}MB) may be too large...`
  );
}
```

### 2. Server-Side Warnings (`src/app/api/files/upload/route.ts`)
```typescript
// Logs warning for files > 30MB
if (fileSizeInMB > 30) {
  console.warn(`⚠️ Large file detected: ${fileSizeInMB.toFixed(2)}MB`);
}
```

### 3. Netlify Configuration (`netlify.toml`)
```toml
[functions]
  node_bundler = "esbuild"
```

## User Communication

**For the user who experienced this:**

> Hi! I investigated the "main.mp4" upload error. Your file (41.84MB) is hitting our server timeout limits.
>
> **Quick solutions:**
> 1. Compress the video to under 30MB using HandBrake or FFmpeg
> 2. Split it into smaller parts
>
> **Long-term:** We're working on supporting much larger files (up to 5GB) by upgrading our upload system. This will be available soon!
>
> Let me know if you need help compressing the file!

## Next Steps

1. ✅ Improve error messages (DONE)
2. ✅ Add logging for large files (DONE)
3. ⬜ Update FAQ with file size best practices
4. ⬜ Decide on long-term solution (recommend Supabase Storage)
5. ⬜ Implement chosen solution
6. ⬜ Test with large files (40MB, 60MB, 80MB, 100MB)
7. ⬜ Update documentation

## Testing Checklist

After implementing the solution:
- [ ] Upload 10MB file (should work)
- [ ] Upload 30MB file (should work)
- [ ] Upload 50MB file (should work with new solution)
- [ ] Upload 80MB file (should work with new solution)
- [ ] Upload 100MB file (should work with new solution)
- [ ] Upload 101MB file (should be rejected by validation)
- [ ] Test timeout error message (before implementing solution)
- [ ] Test successful upload message
- [ ] Monitor error logs for new issues

---

**Status:** Error diagnosed, immediate fixes deployed, long-term solution pending decision
**Priority:** Medium-High (affects user experience for files > 30MB)
**Estimated fix time:** 2-4 hours for Supabase Storage implementation
