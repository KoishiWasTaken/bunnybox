# Quick Start Guide

## ⚠️ IMPORTANT: You Need to Set Up Environment Variables

Your `.env.local` file is currently empty, which is why you're getting sign-in errors.

## Quick Setup (5 minutes)

### 1. Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project (or create one)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) ⚠️ Keep this secret!

### 2. Update .env.local

Open `bunnybox/.env.local` and paste:

```env
NEXT_PUBLIC_SUPABASE_URL=https://puqcpwznfkpchfxhiglh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
CLEANUP_API_KEY=any_random_string_here
```

Replace `your_anon_key_here` and `your_service_role_key_here` with your actual keys.

For `CLEANUP_API_KEY`, use any random string (e.g., `my-secure-cleanup-key-12345`).

### 3. Restart Dev Server

```bash
# Stop the dev server (Ctrl+C in the terminal where it's running)
# Then restart:
cd bunnybox
bun run dev
```

### 4. Test

Now try:
1. Sign in / Sign up - should work ✅
2. Upload files - should work ✅
3. Upload .osk file - should work ✅

## What's Already Done

✅ Audio/video preview (first 10 seconds only)
✅ File chunking for large files (up to 100MB)
✅ Comprehensive error logging
✅ All file types supported
✅ Environment error handling

## Need More Help?

See detailed guides in `.same/` folder:
- `SETUP-ENVIRONMENT.md` - Detailed environment setup
- `TROUBLESHOOTING-UPLOADS.md` - Upload issue debugging
- `SETUP-FILE-CHUNKS.md` - File chunking system
- `VERSION-24-CHANGES.md` - Recent changes
- `VERSION-25-CHANGES.md` - Latest fixes

## Ready to Deploy?

Once everything is working locally:
1. Test thoroughly
2. Tell me "deploy to production"
3. I'll deploy to Netlify

---

**Current Status**: Version 25 created, dev server running, waiting for environment variables to be set up.
