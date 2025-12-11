# Git Documentation Index 📚

## 🎯 START HERE: Quick Navigation

### When to Use Each Guide

**🚨 Git Commands Not Working?**
→ Read [GIT-TROUBLESHOOTING.md](GIT-TROUBLESHOOTING.md)

**📝 Ready to Commit Changes?**
→ Read [GIT-WORKFLOW.md](GIT-WORKFLOW.md)

**✅ Need a Quick Checklist?**
→ Read [GIT-CHECKLIST.md](GIT-CHECKLIST.md)

**📖 General Project Info?**
→ Read [README.md](README.md)

---

## 📁 Complete File Guide

### 1. GIT-WORKFLOW.md
**Purpose**: Complete step-by-step workflow for committing and pushing changes

**When to read**: Every time before committing changes

**Contains**:
- Pre-commit checklist
- How to identify version gaps
- Commit message templates
- Common scenarios (single version, multiple versions, etc.)
- Emergency procedures
- Quick command reference

**Best for**: Detailed instructions on the entire git workflow

---

### 2. GIT-CHECKLIST.md
**Purpose**: Quick pre-flight checklist before git operations

**When to read**: Right before running git commands

**Contains**:
- 6-step verification checklist
- Version identification steps
- Commit strategy verification
- Common mistakes to avoid

**Best for**: Quick verification that you're doing it right

---

### 3. GIT-TROUBLESHOOTING.md
**Purpose**: Solutions for common git issues

**When to read**: When git commands fail or behave unexpectedly

**Contains**:
- Fix for "not a git repository" error
- One-line quick fix command
- Repository information
- Prevention tips
- Why systematic commits matter

**Best for**: Fixing broken git repository

---

### 4. README.md
**Purpose**: Main project documentation

**When to read**: For general project information

**Contains**:
- Links to all git workflow files
- Quick git reference
- Project features and setup
- Version history
- Deployment information

**Best for**: Project overview and getting started

---

## 🔄 Typical Workflow

```
┌─────────────────────────────────┐
│  1. Check if Git Works          │
│     git status                   │
│     ↓                            │
│     If fails → GIT-TROUBLESHOOTING.md
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  2. Check GIT-CHECKLIST.md       │
│     Follow the 6 steps           │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  3. Use GIT-WORKFLOW.md          │
│     For detailed instructions    │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  4. Commit & Push                │
│     git push origin main         │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  5. Auto-Deploy to Production    │
│     https://bunnybox.moe         │
└─────────────────────────────────┘
```

---

## 🎓 Learning Path

**If you're new to this project:**
1. Read README.md (project overview)
2. Read GIT-WORKFLOW.md (understand the process)
3. Read GIT-CHECKLIST.md (quick reference)
4. Bookmark GIT-TROUBLESHOOTING.md (for when things break)

**If you're committing changes:**
1. Open GIT-CHECKLIST.md
2. Follow each step
3. Reference GIT-WORKFLOW.md if needed
4. Keep GIT-TROUBLESHOOTING.md handy

---

## ⚡ Quick Commands

```bash
# Fix broken git repository
cd /home/project/bunnybox && rm -rf .git && git clone https://github.com/KoishiWasTaken/bunnybox.git temp_repo && cp -r temp_repo/.git ./ && rm -rf temp_repo

# Check versions
git log --oneline -1           # Production version
cat .same/todos.md | head -30  # Same version

# Standard commit
git add -A
git commit -m "v[VERSION]: [title]

- [change]

🤖 Generated with Same (https://same.new)
Co-Authored-By: Same <noreply@same.new>"
git push origin main
```

---

## 📊 File Summary

| File | Size | Purpose | Frequency |
|------|------|---------|-----------|
| GIT-WORKFLOW.md | ~8KB | Detailed workflow | Every commit |
| GIT-CHECKLIST.md | ~2KB | Quick checklist | Every commit |
| GIT-TROUBLESHOOTING.md | ~3KB | Fix git issues | When broken |
| README.md | ~5KB | Project info | Reference |

---

## 🔗 Important Links

- **GitHub**: https://github.com/KoishiWasTaken/bunnybox
- **Production**: https://bunnybox.moe
- **Netlify**: Auto-deploys on push to `main`

---

## 💡 Pro Tips

1. **Always check GIT-CHECKLIST.md before committing**
2. **Bookmark GIT-TROUBLESHOOTING.md for quick access**
3. **Keep GIT-WORKFLOW.md open while committing**
4. **Commit versions in chronological order (v78 → v79 → v80)**
5. **Never squash multiple versions into one commit**
6. **Always include descriptive commit messages**

---

**Last Updated**: December 11, 2025

**Next time you commit, start with: [GIT-CHECKLIST.md](GIT-CHECKLIST.md)** ✅
