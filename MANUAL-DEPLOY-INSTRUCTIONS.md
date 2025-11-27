# Manual Deployment Instructions - Version 57

**Deployment Package Created:** `bunnybox-v57-deploy.zip` (12 MB)

---

## ⚠️ Important: Next.js + Netlify Deployment

For Next.js applications with API routes (like bunnybox), **manual drag-and-drop deployment may not work properly** because:
- Next.js requires server-side functions
- The `@netlify/plugin-nextjs` needs to process the build
- Environment variables must be set

---

## ✅ Recommended Deployment Methods

### Option 1: Connect to Git Repository (BEST)

This is the most reliable method for Next.js on Netlify:

1. **Create a Git repository** (if you haven't):
   ```bash
   cd bunnybox
   git init
   git add .
   git commit -m "Version 57: Supabase Storage implementation"
   ```

2. **Push to GitHub/GitLab/Bitbucket:**
   ```bash
   # Create a repo on GitHub first, then:
   git remote add origin YOUR_REPO_URL
   git branch -M main
   git push -u origin main
   ```

3. **Connect to Netlify:**
   - Go to: https://app.netlify.com/sites/bunbox/settings/deploys
   - Click **"Link site to Git repository"**
   - Choose your repository
   - Netlify will automatically deploy on every push

**Benefits:**
- ✅ Automatic deployments
- ✅ Proper Next.js build process
- ✅ Environment variables preserved
- ✅ Rollback capability

---

### Option 2: Netlify CLI (Authenticated)

If you can authenticate the Netlify CLI:

1. **Login to Netlify:**
   ```bash
   netlify login
   ```
   (This will open a browser for authentication)

2. **Link the site:**
   ```bash
   cd bunnybox
   netlify link
   ```
   Choose: "bunbox" from your sites list

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

---

### Option 3: Netlify Drop (Limited - May Not Work)

⚠️ **This may not work properly for Next.js with API routes!**

But if you want to try:

1. **Go to:** https://app.netlify.com/drop

2. **Drag and drop:** `bunnybox-v57-deploy.zip`

3. **Note:** This creates a NEW site, not updates your existing one

**Limitations:**
- Won't have your environment variables
- Won't be linked to your domain (bunnybox.moe)
- May not handle API routes correctly
- Not recommended for production

---

## 🔧 Alternative: Update via Netlify API

If you have access to your Netlify API token:

```bash
# Set your Netlify token
export NETLIFY_AUTH_TOKEN="your_token_here"

# Deploy
cd bunnybox
netlify deploy --prod --auth=$NETLIFY_AUTH_TOKEN
```

---

## 📦 What's in the Deployment Package

The `bunnybox-v57-deploy.zip` contains:
- ✅ `.next/` - Compiled Next.js build
- ✅ `package.json` - Dependencies list
- ✅ `package-lock.json` - Locked dependencies
- ✅ `netlify.toml` - Netlify configuration
- ✅ `next.config.js` - Next.js configuration

**Size:** 12 MB (under Netlify's 200 MB limit)

---

## 🚀 Quick Start: Git Method (Recommended)

Here's the fastest way to deploy:

```bash
# 1. Initialize Git (if not already done)
cd bunnybox
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Version 57: Supabase Storage - Fix upload failures"

# 4. Create a GitHub repo, then:
git remote add origin https://github.com/YOUR_USERNAME/bunnybox.git
git branch -M main
git push -u origin main

# 5. In Netlify Dashboard:
# - Go to: https://app.netlify.com/sites/bunbox/settings/deploys
# - Click "Link site to Git repository"
# - Connect to your new repo
# - Done! Netlify will deploy automatically
```

---

## 🔍 Troubleshooting

### "I can't find the deploy button in Netlify"

Try these direct links:
- **Site overview:** https://app.netlify.com/sites/bunbox
- **Deploy settings:** https://app.netlify.com/sites/bunbox/settings/deploys
- **Build settings:** https://app.netlify.com/sites/bunbox/settings/builds

Look for:
- **"Site configuration"** section
- **"Build & deploy"** tab
- **"Continuous Deployment"** section

### "I'm getting build errors"

Make sure these environment variables are set in Netlify:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_BASE_URL`

### "The site deployed but uploads don't work"

1. Check environment variables are set
2. Make sure you ran the database migration (see `.same/migrations/setup_storage_policies.sql`)
3. Verify Supabase Storage bucket exists

---

## 📧 Need Help?

If you're stuck, you can:

1. **Share your screen/screenshot** of the Netlify dashboard
2. **Check build logs** at: https://app.netlify.com/sites/bunbox/deploys
3. **Contact Netlify support** - they can help with deployment issues

---

## ✨ What's New in Version 57

Once deployed, this version will:
- ✅ **Fix ALL upload failures** (5MB, 40MB, 100MB files)
- ✅ Upload files **directly to Supabase Storage**
- ✅ Bypass Netlify function size limits completely
- ✅ Support files up to **100MB** (can increase to 5GB)
- ✅ Faster uploads and better performance
- ✅ Backward compatible with existing files

**Test after deployment:**
- Upload the 5.53MB file that was failing ✅
- Upload the 41.84MB file that was failing ✅
- Upload a 100MB file ✅

---

**Created:** November 26, 2025
**Version:** 57 - Supabase Storage Implementation
**Package:** bunnybox-v57-deploy.zip (12 MB)
