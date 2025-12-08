# Environment Setup Guide

## Problem

If you get errors like `"<!DOCTYPE "... is not valid JSON"` when trying to sign in or upload files, it means your environment variables are not set up.

## Solution

You need to add your Supabase credentials to the `.env.local` file.

### Step 1: Copy the example file

```bash
cp .env.example .env.local
```

### Step 2: Get your Supabase credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - This is secret, never commit it!

### Step 3: Update .env.local

Open `bunnybox/.env.local` and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://puqcpwznfkpchfxhiglh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Cleanup API Key (generate a random secure string)
CLEANUP_API_KEY=your_random_secure_key_here
```

### Step 4: Generate a cleanup API key

For the `CLEANUP_API_KEY`, generate a random secure string:

```bash
openssl rand -hex 32
```

Or use any random string generator.

### Step 5: Restart the dev server

After updating `.env.local`:

```bash
# Stop the dev server (Ctrl+C)
# Then restart it
cd bunnybox
bun run dev
```

## Verify Setup

1. Try signing in - should work now
2. Try uploading a file - should work now
3. Check the terminal logs - should see detailed logging

## Security Notes

⚠️ **NEVER commit `.env.local` to git!**

The `.env.local` file is already in `.gitignore`, but double-check:
- Never share your `SUPABASE_SERVICE_ROLE_KEY`
- Never commit it to version control
- Never expose it in client-side code

## Troubleshooting

If you still get errors after setting up environment variables:

1. **Check the file location**: `.env.local` must be in the `bunnybox/` directory (next to `package.json`)
2. **Check for typos**: Variable names must match exactly
3. **Restart dev server**: Changes to `.env.local` require a restart
4. **Check Supabase status**: Make sure your Supabase project is active
