# Bunnybox Development Notes

## 🚨 IMPORTANT: Git Repository Issue
**If git commands fail with "not a git repository" error**, see `GIT-TROUBLESHOOTING.md` for the quick fix.

**Quick solution:**
```bash
cd /home/project/bunnybox && rm -rf .git && git clone https://github.com/KoishiWasTaken/bunnybox.git temp_repo && cp -r temp_repo/.git ./ && rm -rf temp_repo
```

## ⚠️ CRITICAL: Systematic Git Commits to Prevent Data Loss

**When committing changes to GitHub for auto-deployment, ALWAYS commit systematically in chronological order.**

### The Problem
If commits are made out of order or multiple versions are squashed into one commit, it becomes impossible to:
- Track when specific features were added
- Revert to a specific version if issues arise
- Understand the progression of changes
- Debug issues that occurred between versions

### ✅ Correct Workflow

**ALWAYS commit in chronological order from production → current:**

1. **Identify the version gap:**
   ```bash
   # Check latest production version
   git log --oneline -1

   # Current version in Same environment (check todos.md or version history)
   ```

2. **Commit each version individually:**
   ```bash
   # Example: Production is v77, Same is at v79

   # Commit v78 first
   git add .
   git commit -m "v78: Critical cleanup bug fix + recovery tools

   - Fixed orphaned files detection in cleanup system
   - Added storage_path check to prevent deletion
   - Created recovery scanner (bun run recover)
   - Created auto-restoration (bun run restore)

   🤖 Generated with Same (https://same.new)
   Co-Authored-By: Same <noreply@same.new>"

   # Then commit v79
   git add .
   git commit -m "v79: Admin panel media previews

   - Added FilePreview component for thumbnails
   - Image and video previews in admin panel
   - Faster content moderation workflow

   🤖 Generated with Same (https://same.new)
   Co-Authored-By: Same <noreply@same.new>"

   # Push all commits
   git push origin main
   ```

3. **Verify commit history:**
   ```bash
   git log --oneline -5
   # Should show v77 → v78 → v79 in order
   ```

### 📋 Commit Message Template

```
v[VERSION]: [Brief title]

- [Feature/change 1]
- [Feature/change 2]
- [Feature/change 3]

🤖 Generated with Same (https://same.new)
Co-Authored-By: Same <noreply@same.new>
```

### 🚫 What NOT to Do

❌ **Don't squash multiple versions into one commit:**
```bash
# WRONG: Combining v78 and v79
git commit -m "Various updates and fixes"
```

❌ **Don't commit out of chronological order:**
```bash
# WRONG: Committing v79 before v78
```

❌ **Don't use vague commit messages:**
```bash
# WRONG: No context about what changed
git commit -m "Updates"
```

### ✅ Why This Matters

**Benefits of systematic commits:**
- 🔍 **Traceable history** - Know exactly when each feature was added
- 🔄 **Easy rollback** - Revert to any specific version
- 📊 **Clear changelog** - Automatic version history
- 🐛 **Better debugging** - Isolate which version introduced issues
- 🚀 **Safer deployments** - Can deploy incrementally if needed
- 📖 **Documentation** - Commit messages become project history

**Example of good history:**
```
abc1234 v79: Admin panel media previews
def5678 v78: Critical cleanup bug fix + recovery tools
ghi9012 v77: Spanish translation hotfix
jkl3456 v76: Clear all button color fix
```

### 🔧 Quick Reference

**Before committing to GitHub:**
1. Check current production version (`git log`)
2. Check current Same version (`cat .same/todos.md`)
3. Commit each version gap individually
4. Use descriptive commit messages with version numbers
5. Verify commit order before pushing
6. Push all commits at once

---

# BunnyBox - File Hosting Service

## Current Version: 21
**Last Updated:** November 25, 2025

## Recent Changes

### Version 21 - Automated Cleanup System
- ✅ Daily automated cleanup (runs at 2 AM UTC)
- ✅ Expired files cleanup
- ✅ Orphaned/failed uploads cleanup
- ✅ Inactive accounts cleanup (6+ months)
- ✅ Upload rollback protection
- ✅ Manual cleanup script (`bun run cleanup`)

### Version 19 - Fixed File Deletion
- ✅ Fixed file deletion using service role key
- ⚠️ Requires `SUPABASE_SERVICE_ROLE_KEY` in environment

### Version 18 - Major Features
- ✅ Audio file previews
- ✅ Dashboard table view with pagination
- ✅ Rate limit: 100 uploads/day
- ✅ Escalating ban system
- ✅ Account inactivity deletion (6 months)

## Setup Checklist

### Required Environment Variables

#### Local Development (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://puqcpwznfkpchfxhiglh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLEANUP_API_KEY=your_cleanup_key
```

#### Production (Netlify)
1. `SUPABASE_SERVICE_ROLE_KEY` - Required for deletions
2. `CLEANUP_API_KEY` - Required for automated cleanup

### Get Service Role Key
1. Visit: https://supabase.com/dashboard/project/puqcpwznfkpchfxhiglh/settings/api
2. Copy the **service_role** key
3. Add to `.env.local` and Netlify environment variables

## Available Commands

```bash
# Development
bun run dev              # Start dev server

# Cleanup
bun run cleanup          # Manual cleanup (local)

# Testing
bun run lint             # Check for errors
```

## Key Features

### File Management
- Upload files up to 100MB
- Auto-deletion options (1 hour - 30 days, or never for logged-in users)
- File previews: images, text, audio
- Detailed file statistics

### User Accounts
- Sign up with username/password
- Dashboard with file management
- Permanent file storage option
- Account deletion with double confirmation

### Security & Limits
- Rate limiting: 100 uploads per 24 hours
- Escalating bans (1 week → permanent)
- Filename sanitization
- Profanity filtering

### Automated Maintenance
- Daily cleanup at 2 AM UTC
- Expired files removed automatically
- Failed uploads cleaned up
- Inactive accounts deleted after 6 months

## Documentation Files

- `SETUP_SERVICE_KEY.md` - Service role key setup guide
- `CLEANUP_SYSTEM.md` - Cleanup system documentation
- `version-18-notes.md` - Version 18 detailed notes

## Deployment

**Production URL:** https://bunbox.netlify.app

To deploy:
1. Ensure all environment variables are set in Netlify
2. Deployment will happen automatically when ready
3. The scheduled cleanup function will be deployed with the site

## Next Steps

1. ✅ Add service role key to local `.env.local`
2. ✅ Add service role key to Netlify environment
3. ✅ Add cleanup API key to Netlify environment
4. ✅ Test file deletion locally
5. ✅ Test manual cleanup script
6. 🔄 Deploy to production when ready

## Support

For issues or questions, contact @.koishi on Discord.
