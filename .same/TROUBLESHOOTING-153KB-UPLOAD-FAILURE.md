# Troubleshooting 153KB Upload Failure

**Date:** November 27, 2025
**Error:** "Failed to save file metadata"
**File Size:** 153KB

---

## 🔍 What We Know

1. **Small file size:** 153KB is well within limits, so this is NOT a file size issue
2. **Error location:** The error occurs in Step 3 (finalize-upload) AFTER the file has already been uploaded to Supabase Storage
3. **Database insert failure:** The database insert is failing, but we don't know why yet

---

## ✅ What We've Done

1. **Improved error logging** (Commit: cfcc54a)
   - Added detailed error logging to capture full database error
   - Now returns actual error message to help diagnose
   - Logs error.code, error.details, error.hint

2. **Pushed to GitHub**
   - Changes are deploying to Netlify now
   - Will take ~2-3 minutes

---

## 🧪 Next Steps to Diagnose

### Step 1: Wait for Netlify Deployment

Check deployment status:
- Go to https://app.netlify.com/sites/bunbox/deploys
- Wait for "Published" status

### Step 2: Try Upload Again

Once deployed:
1. Go to https://bunnybox.moe
2. Try uploading the 153KB file again
3. **Open browser console (F12) before uploading**
4. Look for detailed error messages

The error message should now include the actual database error instead of just "Failed to save file metadata"

### Step 3: Check Netlify Function Logs

Go to Netlify function logs:
1. Visit https://app.netlify.com/sites/bunbox/functions
2. Find the `finalize-upload` function
3. Look for the most recent error logs
4. Should see console.error output with:
   - error.message
   - error.code
   - error.details
   - error.hint
   - All field values being inserted

### Step 4: Verify Database Schema

Run the verification script in Supabase SQL Editor:
- File: `.same/verify-database-schema.sql`
- Go to: https://supabase.com/dashboard/project/puqcpwznfkpchfxhiglh/sql
- Copy and paste the SQL from the verification file
- Run each query section

**What to check:**
1. ✅ `storage_path` column exists (TEXT, nullable)
2. ✅ `uses_storage` column exists (BOOLEAN, default FALSE)
3. ✅ Indexes exist for both columns
4. ✅ Storage policies are set up correctly

---

## 🤔 Possible Root Causes

### 1. Missing Database Columns
**Symptom:** Migration wasn't applied
**Check:** Run verify-database-schema.sql
**Fix:** Run setup_storage_policies.sql migration

### 2. Constraint Violation
**Symptom:** error.code = '23XXX' (constraint violation)
**Examples:**
- Duplicate file ID (unlikely with random generation)
- Foreign key violation on uploader_id
- Check constraint on filesize/filename

**Fix:** Check error.details for which constraint

### 3. Invalid Field Values
**Symptom:** error.code = '22XXX' (data exception)
**Examples:**
- Invalid MIME type format
- Filesize out of range
- Invalid timestamp format

**Fix:** Check which field is causing the issue

### 4. RLS Policy Issue
**Symptom:** error.code = '42501' (insufficient privilege)
**Note:** Unlikely because we use supabaseAdmin
**Fix:** Check storage policies

---

## 📋 Information Needed to Debug

When you try the upload again, please provide:

1. **Full error message** from browser console
2. **Netlify function logs** for the finalize-upload call
3. **Database verification results** from verify-database-schema.sql

This information will tell us exactly what's wrong!

---

## 🔧 Quick Fixes (If Known Issue)

### If Missing Columns:
```sql
-- Run in Supabase SQL Editor
ALTER TABLE files
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS uses_storage BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_files_storage_path ON files(storage_path);
CREATE INDEX IF NOT EXISTS idx_files_uses_storage ON files(uses_storage);
```

### If Storage Policies Missing:
See: `.same/migrations/setup_storage_policies.sql`

---

## 📊 Expected Behavior

After upload succeeds, you should see in the database:
```sql
{
  id: 'abc12345',
  filename: 'yourfile.jpg',
  filesize: 153000,
  storage_path: 'abc12345/yourfile.jpg',
  uses_storage: true,
  file_data: null,
  mime_type: 'image/jpeg',
  ...
}
```

---

**Status:** ⏳ Waiting for deployment and retry
**Next:** Try upload after deployment completes
