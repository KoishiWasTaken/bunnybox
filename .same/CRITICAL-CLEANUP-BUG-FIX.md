# 🚨 CRITICAL BUG FIX: Cleanup System Deleting Storage Files

**Date:** December 10, 2025
**Severity:** CRITICAL
**Status:** ✅ FIXED
**Affected Versions:** v21-v77

---

## 🐛 The Problem

The automated cleanup system (introduced in v21) had a critical bug that **deleted database records for files stored in Supabase Storage**.

### What Happened

The cleanup system runs daily at 2 AM UTC and is designed to clean up:
1. Expired files
2. **Orphaned/failed uploads** ← THE BUG WAS HERE
3. Inactive accounts (6+ months)
4. Old error logs

### The Bug

The "orphaned files" detection logic was checking if a file had:
- No `file_data` (base64 data in database)
- No `chunks` (chunked upload data)

**BUT it was NOT checking for `storage_path`** (files stored in Supabase Storage).

### Result

All files uploaded via:
- Batch upload system
- Storage-based uploads (most modern uploads)
- Files larger than a few KB

...were being deleted from the database during cleanup, even though they were set to "Never expire" and the actual files still existed in Supabase Storage!

---

## ✅ The Fix

**File:** `src/app/api/cleanup/route.ts`

**Changed:**
```typescript
// BEFORE (BUGGY)
const { data: potentialOrphans } = await supabaseAdmin
  .from('files')
  .select('id, file_data')
  .or('file_data.is.null,file_data.eq.');

// Check for chunks only
if (!chunks || chunks.length === 0) {
  trueOrphans.push(file.id);
}
```

**To:**
```typescript
// AFTER (FIXED)
const { data: potentialOrphans } = await supabaseAdmin
  .from('files')
  .select('id, file_data, storage_path')  // ← Added storage_path
  .or('file_data.is.null,file_data.eq.');

// Skip files with storage_path
if (file.storage_path) {
  continue;  // ← This prevents deletion of storage-based files
}

// Then check for chunks
if (!chunks || chunks.length === 0) {
  trueOrphans.push(file.id);
}
```

**Key Change:** The cleanup now **excludes files with a `storage_path`** from being considered orphaned.

---

## 🔧 Recovery Instructions

If your files were deleted by this bug, follow these steps:

### Step 1: Check for Orphaned Files

Run the recovery scanner:
```bash
cd bunnybox
bun run recover
```

This will show you all files that exist in Supabase Storage but are missing from the database.

### Step 2: Restore Your Files

To automatically restore the database records:

```bash
bun run restore YOUR_USER_ID
```

**Finding Your User ID:**
1. Sign in to bunnybox
2. Open browser console (F12)
3. Run this command:
   ```javascript
   localStorage.getItem("sb-puqcpwznfkpchfxhiglh-auth-token")
   ```
4. Look for `"user"` → `"id"` in the JSON output
5. Copy that ID (it looks like: `123e4567-e89b-12d3-a456-426614174000`)

**Example:**
```bash
bun run restore 123e4567-e89b-12d3-a456-426614174000
```

### Step 3: Verify Restoration

After running the restore script:
1. Visit https://bunnybox.moe/dashboard
2. Your files should be back!
3. They will be set to "Never expire" by default

---

## 📊 Impact Assessment

### Who Was Affected?

- Users who uploaded files via batch upload
- Users who uploaded files to storage (most modern uploads)
- Files uploaded between v21 (when cleanup was added) and today

### What Was Lost?

- Database records (file metadata)
- Upload counts
- View counts
- File statistics

### What Was NOT Lost?

- ✅ The actual files (they're still in Supabase Storage)
- ✅ User accounts
- ✅ Other database data

---

## 🚀 Deployment Checklist

- [x] Fix cleanup logic in `src/app/api/cleanup/route.ts`
- [x] Create recovery scripts:
  - [x] `scripts/recover-storage-files.ts` (scan for orphaned files)
  - [x] `scripts/restore-deleted-files.ts` (auto-restore database records)
- [x] Add scripts to `package.json`:
  - [x] `bun run recover`
  - [x] `bun run restore <user_id>`
- [x] Create documentation (this file)
- [ ] Deploy fix to production
- [ ] Notify affected users
- [ ] Run restoration for known affected users

---

## 🔍 Testing the Fix

### Local Testing

1. Start dev server:
   ```bash
   bun run dev
   ```

2. Upload a file to storage

3. Run cleanup:
   ```bash
   bun run cleanup
   ```

4. Check that the file is **NOT** deleted

### Production Testing

After deployment:
1. Monitor cleanup logs in Netlify Functions
2. Check that storage files are not being deleted
3. Verify file counts remain stable

---

## 📝 Prevention

### Code Review Checklist

When modifying cleanup logic:
- [ ] Check for `file_data` (base64 in DB)
- [ ] Check for `chunks` (chunked uploads)
- [ ] Check for `storage_path` (Supabase Storage files)
- [ ] Test with all three file types
- [ ] Verify no valid files are deleted

### Monitoring

Add alerts for:
- Sudden drops in file count
- Cleanup deleting > 10 files at once
- Storage vs database file count mismatches

---

## 🆘 Support

If you've been affected by this bug:

1. **Quick Recovery:** Follow the recovery instructions above
2. **Need Help?** Contact @.koishi on Discord
3. **Email:** support@bunnybox.moe

Include:
- Your username
- Approximate number of files lost
- When you uploaded them
- Your user ID (if known)

---

## 📚 Related Files

- `src/app/api/cleanup/route.ts` - Cleanup logic (FIXED)
- `scripts/recover-storage-files.ts` - Recovery scanner
- `scripts/restore-deleted-files.ts` - Auto-restoration
- `netlify/functions/scheduled-cleanup.ts` - Automated cleanup trigger

---

**Status:** ✅ Bug fixed, recovery tools ready, awaiting deployment
