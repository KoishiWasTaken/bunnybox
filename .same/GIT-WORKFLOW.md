# Git Workflow Quick Reference Guide

## 🚨 CHECK THIS FILE BEFORE ANY GIT OPERATION! 🚨

This file contains the step-by-step workflow for committing and pushing changes to GitHub.

---

## Pre-Commit Checklist ✅

**ALWAYS run these checks before committing:**

### 1. Check if Git is Working
```bash
cd /home/project/bunnybox
git status
```

**If you see "fatal: not a git repository":**
```bash
# Quick fix (see GIT-TROUBLESHOOTING.md for details)
cd /home/project/bunnybox && rm -rf .git && git clone https://github.com/KoishiWasTaken/bunnybox.git temp_repo && cp -r temp_repo/.git ./ && rm -rf temp_repo
```

### 2. Identify Version Gap
```bash
# Check production version (what's deployed)
git log --oneline -1

# Check current Same version
cat .same/todos.md | head -30
```

### 3. Plan Your Commits
- **Production version**: ___ (from git log)
- **Same version**: ___ (from todos.md)
- **Versions to commit**: ___ (list each version individually)

---

## Commit Workflow 📝

### Step 1: Stage Changes
```bash
cd /home/project/bunnybox
git add -A
```

### Step 2: Check What Will Be Committed
```bash
git status
git diff --stat
```

### Step 3: Commit EACH Version Individually

**Template for each version:**
```bash
git commit -m "v[VERSION]: [Brief descriptive title]

- [Key change 1]
- [Key change 2]
- [Key change 3]

🤖 Generated with Same (https://same.new)
Co-Authored-By: Same <noreply@same.new>"
```

**Real Example:**
```bash
git commit -m "v81: Reduce maximum file size limit to 50MB

- Updated validation logic from 100MB to 50MB
- Updated FAQ translations for all 11 languages
- Added storage diagnostics endpoints
- Created upload troubleshooting documentation

🤖 Generated with Same (https://same.new)
Co-Authored-By: Same <noreply@same.new>"
```

### Step 4: Verify Commit History
```bash
git log --oneline -5
```

**Expected output should show versions in chronological order:**
```
abc1234 v81: Reduce maximum file size limit to 50MB
def5678 v80: [previous version]
...
```

### Step 5: Push to GitHub
```bash
git push origin main
```

---

## Common Scenarios 🎯

### Scenario A: Single Version to Commit
**Example: Production is v80, Same is v81**

```bash
git add -A
git commit -m "v81: [title]

- [changes]

🤖 Generated with Same (https://same.new)
Co-Authored-By: Same <noreply@same.new>"
git push origin main
```

### Scenario B: Multiple Versions Behind
**Example: Production is v78, Same is v81**

```bash
# Commit v79 first
git add .
git commit -m "v79: [title]
...
"

# Then commit v80
git commit -m "v80: [title]
...
"

# Then commit v81
git commit -m "v81: [title]
...
"

# Push all at once
git push origin main
```

### Scenario C: Changes But No New Version
**Example: Bug fixes or documentation updates**

```bash
git add -A
git commit -m "fix: [what was fixed]

🤖 Generated with Same (https://same.new)
Co-Authored-By: Same <noreply@same.new>"
git push origin main
```

---

## Commit Message Guidelines 📋

### Version Commits
Format: `v[NUMBER]: [Brief descriptive title]`

**Good examples:**
- `v81: Reduce maximum file size limit to 50MB`
- `v80: Add mobile responsive navigation menu`
- `v79: Admin panel media previews for faster moderation`

**Bad examples:**
- ❌ `Updates`
- ❌ `Various fixes`
- ❌ `v79 and v80` (squashing multiple versions)

### Non-Version Commits
Use conventional commit prefixes:
- `fix:` - Bug fixes
- `feat:` - New features
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Build/tooling changes

---

## Emergency Procedures 🚨

### If Push Fails
```bash
# Check for conflicts
git status

# Pull latest changes
git pull origin main

# Resolve conflicts if any
# Then push again
git push origin main
```

### If Commit Message Was Wrong
```bash
# Amend the last commit message
git commit --amend -m "corrected message"

# Force push (use with caution!)
git push --force origin main
```

### If You Need to Undo Last Commit (Not Pushed Yet)
```bash
# Keep changes in working directory
git reset --soft HEAD~1

# Discard changes entirely (DANGER!)
git reset --hard HEAD~1
```

---

## Production Deployment Info 🚀

- **Repository**: https://github.com/KoishiWasTaken/bunnybox
- **Production URL**: https://bunnybox.moe
- **Auto-Deploy**: Netlify (triggers on push to `main`)
- **Deploy Time**: ~2-3 minutes

---

## Quick Commands Reference 🔧

```bash
# Check status
git status

# View recent commits
git log --oneline -5

# View changes
git diff

# View staged changes
git diff --cached

# Stage all changes
git add -A

# Commit with message
git commit -m "message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Check remote connection
git remote -v
```

---

## 🎯 REMEMBER: ALWAYS COMMIT IN CHRONOLOGICAL ORDER!

✅ **DO**: v78 → v79 → v80 → v81
❌ **DON'T**: v81, v79, v80, v78 (out of order)
❌ **DON'T**: v78-81 combined (squashed)

---

**Last Updated**: December 11, 2025
**Always check GIT-TROUBLESHOOTING.md if git commands fail!**
