# Video Upload Error Fix

## Problem

Users reported that video file uploads (e.g., "video0-2.mov") were failing with the error:
```
"Server returned an invalid response. Please check your filename and try again."
```

This error message was misleading - the issue was **not** with the filename validation, but with how large files were being handled.

## Root Cause

The error occurred when the frontend tried to parse the server response as JSON, but received something else (likely an HTML error page from Netlify or an incomplete response). This happened because:

1. **Large file sizes**: Video files, even under 100MB, become ~33% larger when converted to base64
2. **Database row size limits**: Supabase/PostgreSQL has practical limits on row sizes
3. **Function timeouts**: Netlify functions timeout after 10-26 seconds depending on the tier
4. **Insufficient error handling**: The database insert could fail without returning a proper JSON error response

When a video file was uploaded:
- The file passed filename validation ✅
- The file passed size validation (< 100MB) ✅
- The base64 conversion succeeded ✅
- The database insert **failed silently** or timed out ❌
- The server returned a non-JSON response (HTML error page or timeout) ❌
- The frontend couldn't parse the response and showed the misleading error ❌

## Solution Implemented

### 1. Enhanced Error Handling

```typescript
// Wrapped database insert in try-catch
try {
  const result = await supabaseAdmin.from('files').insert([...]).select().single();
  uploadedFile = result.data;
  error = result.error;
} catch (insertError) {
  // Now catches exceptions that weren't returning JSON
  return NextResponse.json(
    { error: 'Failed to save file to database. The file may be too large...' },
    { status: 500 }
  );
}
```

### 2. Base64 Size Checking

```typescript
// Log base64 size to identify large files
const base64SizeInMB = (base64.length * 0.75) / (1024 * 1024);
console.log(`File: ${filename}, Original: ${file.size} bytes, Base64: ~${base64SizeInMB.toFixed(2)} MB`);

if (base64SizeInMB > 80) {
  console.warn(`Large base64 file detected: ${base64SizeInMB.toFixed(2)} MB`);
}
```

### 3. Specific Error Messages

```typescript
// Provide context-specific error messages
if (error.message?.includes('payload') || error.message?.includes('size') || error.message?.includes('too large')) {
  errorMessage = 'File is too large to store. Please try a smaller file or contact support.';
} else if (error.message?.includes('timeout')) {
  errorMessage = 'Upload timed out. Please try a smaller file.';
}
```

### 4. Detailed Error Logging

```typescript
console.error('Database insert error:', error);
console.error('Error code:', error.code);
console.error('Error message:', error.message);
console.error('Error details:', error.details);
```

### 5. Video Preview Support

Added video file preview support for common video formats:
- `.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`, `.wmv`, `.flv`, `.mkv`, `.m4v`, `.3gp`

Users can now preview video files directly in the browser (for files that successfully upload and aren't too large).

## Current Limitations

### File Size Considerations

- **100MB upload limit** (before base64 conversion)
- **~133MB base64 limit** (after conversion, due to 33% size increase)
- **Practical limit**: Videos should ideally be under 50-70MB for reliable uploads

Large video files may:
- Take a long time to upload
- Timeout during database insertion
- Exceed Supabase row size limits
- Cause browser performance issues during preview

### Recommendations for Users

1. **Compress videos** before uploading (use tools like HandBrake, FFmpeg)
2. **Use modern codecs** (H.264/H.265 for better compression)
3. **Lower resolution** for very long videos (720p instead of 1080p)
4. **Trim unnecessary parts** to reduce file size

## Testing

To test the fix:

1. Try uploading a small video file (< 10MB) - should work ✅
2. Try uploading a medium video file (20-50MB) - should work ✅
3. Try uploading a large video file (70-100MB) - may work or show clear error message ✅
4. Video preview should display for successfully uploaded videos ✅
5. Error messages should always be JSON formatted ✅

## Future Improvements

Consider implementing:
- [ ] Chunked file uploads for large files
- [ ] Cloud storage integration (S3, Cloudflare R2) instead of database storage
- [ ] Client-side video compression before upload
- [ ] Streaming video playback instead of base64 data URLs
- [ ] File size warnings before upload based on file type
