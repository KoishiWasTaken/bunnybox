# Upload Troubleshooting Guide

## Overview

This guide helps diagnose and fix file upload issues. The system now has comprehensive logging to help identify exactly where problems occur.

## Supported File Types

**All file types are supported** as long as they meet the size requirements:
- Maximum file size: 100MB
- Maximum filename length: 255 characters
- No control characters in filename (null bytes, etc.)

Common file types include:
- Images: .jpg, .png, .gif, .webp, .bmp, .svg, .ico
- Videos: .mp4, .mov, .avi, .webm, .mkv, .flv
- Audio: .mp3, .wav, .ogg, .flac, .m4a, .aac
- Documents: .pdf, .doc, .docx, .txt, .md
- Archives: .zip, .rar, .7z, .tar, .gz
- Code: .js, .ts, .py, .java, .c, .cpp
- **Custom formats: .osk, .skin, .exe, .dmg, etc.**

## Checking Server Logs

The upload route now logs detailed information at each step:

1. **Request Start**: `=== Upload Request Started ===`
2. **IP Address**: Shows requester's IP
3. **File Received**: Shows filename, size, and MIME type
4. **Validation**: Logs if filename or size validation fails
5. **Sanitization**: Shows original vs sanitized filename
6. **MIME Type**: Shows detected or default MIME type
7. **Conversion**: Logs base64 conversion success/failure
8. **Database Insert**: Shows success or detailed error
9. **Chunking**: If file is large, shows chunk count
10. **Success/Failure**: Final status

### Example Log Output

```
=== Upload Request Started ===
IP: 123.456.789.0
File received: Artifyber.osk, Size: 5242880, Type: application/octet-stream
Sanitized filename: Artifyber.osk -> Artifyber.osk
Using MIME type: application/octet-stream
Processing file: Artifyber.osk, Size: 5242880 bytes, Type: application/octet-stream
Successfully converted to base64: 6990507 characters
File: Artifyber.osk, Original: 5242880 bytes, Base64: ~5.00 MB
Inserting file record with ID: AbCd1234
File record inserted successfully: AbCd1234
=== Upload Successful: AbCd1234 ===
```

## Common Issues and Solutions

### Issue: "Filename contains invalid control characters"

**Cause**: Filename has null bytes or control characters (ASCII 0-31 or 127)

**Solution**: Rename the file to remove special characters

### Issue: "File size exceeds 100MB limit"

**Cause**: File is too large

**Solution**:
- Compress the file
- Split into multiple parts
- Use a different file hosting service for files > 100MB

### Issue: "Failed to process file"

**Cause**: File conversion to base64 failed

**Possible reasons**:
- File is corrupted
- Browser ran out of memory
- File size near the limit

**Solution**:
- Try a smaller file
- Verify file isn't corrupted
- Close other browser tabs to free memory

### Issue: "Failed to save file to database"

**Cause**: Database insert failed

**Possible reasons**:
- Database connection issue
- Temporary Supabase outage
- Row size limit (should be fixed by chunking)

**Solution**:
- Check server logs for specific error
- Retry upload
- Contact support if persists

## File Chunking System

For files that result in >10MB base64 data:
- Automatically splits into 10MB chunks
- Stores chunks in `file_chunks` table
- Reassembles on download
- Transparent to user

## Rate Limiting

- 100 uploads per 24 hours per IP
- First violation: 1 week ban
- Second violation: Permanent ban

## Testing Upload

To test if a specific file type works:

1. Upload the file
2. Check browser console for errors
3. Check server logs (in terminal where `bun run dev` is running)
4. Look for the detailed log output
5. Identify which step failed

## File Type Detection

MIME types are detected by the browser. If unknown, defaults to `application/octet-stream`.

Common MIME types:
- `.osk` → `application/octet-stream` (generic binary)
- `.mp4` → `video/mp4`
- `.jpg` → `image/jpeg`
- `.txt` → `text/plain`

**Note**: Unknown MIME types are perfectly fine! They're stored as `application/octet-stream` and work correctly.

## Preview Support

Preview is available for:
- Images: All common formats
- Videos: First 10 seconds only (for performance)
- Audio: First 10 seconds only (for performance)
- Text: Up to 1000 characters (expandable)

Files without preview support can still be uploaded and downloaded normally.
