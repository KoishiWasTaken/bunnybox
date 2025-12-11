# Git Pre-Flight Checklist ✈️

## Use this checklist before EVERY git commit/push!

### Step 1: Verify Git is Working
```bash
cd /home/project/bunnybox && git status
```
- [ ] ✅ Git status shows changes (not "fatal: not a git repository")
- [ ] 🔧 If broken, run fix from GIT-TROUBLESHOOTING.md

### Step 2: Identify Versions
```bash
# Production version
git log --oneline -1

# Same version
cat .same/todos.md | head -30
```
- [ ] ✅ Production version: v____
- [ ] ✅ Same version: v____
- [ ] ✅ Versions to commit: v____ through v____

### Step 3: Commit Strategy
- [ ] ✅ I will commit each version individually (NO squashing)
- [ ] ✅ I will commit in chronological order (oldest → newest)
- [ ] ✅ I have read the version details from todos.md

### Step 4: Commit Each Version
For each version from oldest to newest:
```bash
git add -A
git commit -m "v[NUMBER]: [Brief title]

- [Key change 1]
- [Key change 2]
- [Key change 3]

🤖 Generated with Same (https://same.new)
Co-Authored-By: Same <noreply@same.new>"
```
- [ ] ✅ Committed v____
- [ ] ✅ Committed v____
- [ ] ✅ Committed v____

### Step 5: Verify Before Push
```bash
git log --oneline -5
```
- [ ] ✅ Commits are in correct chronological order
- [ ] ✅ Each version has descriptive commit message
- [ ] ✅ Co-authored-by Same is included

### Step 6: Push to GitHub
```bash
git push origin main
```
- [ ] ✅ Push successful
- [ ] ✅ No conflicts or errors
- [ ] ✅ Netlify will auto-deploy in ~2-3 minutes

---

## Common Mistakes to Avoid ❌

- ❌ Committing multiple versions in one commit
- ❌ Committing versions out of chronological order
- ❌ Using vague commit messages like "Updates" or "Fixes"
- ❌ Forgetting to check production vs Same version gap
- ❌ Not staging all files with `git add -A`

---

## Quick Links 🔗

- **Full Workflow**: [GIT-WORKFLOW.md](GIT-WORKFLOW.md)
- **Troubleshooting**: [GIT-TROUBLESHOOTING.md](GIT-TROUBLESHOOTING.md)
- **GitHub Repo**: https://github.com/KoishiWasTaken/bunnybox
- **Production**: https://bunnybox.moe

---

**Last Updated**: December 11, 2025
