# Git Repository Troubleshooting Guide

## ⚠️ CRITICAL ISSUE: Empty .git Directory

### Problem
The `.git` directory in `/home/project/bunnybox` frequently becomes empty, causing git commands to fail with:
```
fatal: not a git repository (or any of the parent directories): .git
```

This happens because the `.git` folder exists but contains no files, making it invalid.

### Root Cause
The git repository loses its internal structure (likely due to the Same environment's session handling or file system state management).

### ✅ SOLUTION (Quick Fix)
When you encounter this issue, run these commands:

```bash
cd /home/project/bunnybox
rm -rf .git
git clone https://github.com/KoishiWasTaken/bunnybox.git temp_repo
cp -r temp_repo/.git ./
rm -rf temp_repo
```

This will:
1. Remove the empty `.git` directory
2. Clone the repository to a temporary location
3. Copy the valid `.git` directory to the project
4. Remove the temporary clone

### Repository Information
- **GitHub Repo**: `KoishiWasTaken/bunnybox`
- **URL**: https://github.com/KoishiWasTaken/bunnybox
- **Branch**: `main`
- **Deployment**: Automatic to Netlify at https://bunnybox.moe

### After Fixing
Once the `.git` directory is restored:
1. Check status: `git status`
2. Verify you're on `main` branch: `git branch`
3. Make your changes and commit normally
4. Push to trigger automatic deployment: `git push origin main`

### Prevention
There is no known prevention for this issue in the Same environment. Simply use the fix above whenever it occurs.

### Notes
- This issue has occurred multiple times in this project
- The fix is quick and reliable (takes ~10-15 seconds)
- All local uncommitted changes are preserved (they exist in the working directory)
- You may need to re-add files after the fix: `git add .`

---

## ⚠️ IMPORTANT: Systematic Commits to Prevent Data Loss

After fixing the `.git` directory, **ALWAYS commit changes systematically in chronological order** when pushing to GitHub for auto-deployment.

### Why This Matters

Committing versions out of order or squashing multiple versions into one commit makes it impossible to:
- Track when specific features were added
- Revert to a specific version safely
- Debug issues between versions
- Maintain clear project history

### ✅ Correct Workflow

**Always commit from production version → current Same version:**

```bash
# 1. Check production version
git log --oneline -1

# 2. Check current Same version
cat .same/todos.md | head -20

# 3. Commit each version individually in order
# Example: Production is v77, Same is at v79

# Commit v78
git add .
git commit -m "v78: Critical cleanup bug fix + recovery tools

- Fixed orphaned files detection
- Added recovery tools

🤖 Generated with Same (https://same.new)
Co-Authored-By: Same <noreply@same.new>"

# Then commit v79
git add .
git commit -m "v79: Admin panel media previews

- Added image/video thumbnails
- Faster moderation

🤖 Generated with Same (https://same.new)
Co-Authored-By: Same <noreply@same.new>"

# Push all commits
git push origin main
```

### 📋 Full Documentation

See **README.md** section "CRITICAL: Systematic Git Commits to Prevent Data Loss" for complete guidelines.

---

**Last Updated**: December 10, 2025
**Issue Frequency**: High (occurs after session restarts or extended periods)
