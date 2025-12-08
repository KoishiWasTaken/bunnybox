import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ MISSING ENVIRONMENT VARIABLES!');
  console.error('Please set up your .env.local file with Supabase credentials.');
  console.error('See .same/SETUP-ENVIRONMENT.md for instructions.');
}

// Client for public/anon operations (respects RLS)
// Use placeholder values if env vars are missing (will fail gracefully)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Admin client for server-side operations (bypasses RLS)
// Falls back to anon client if service key is not set (development mode)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceKey)
  : createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    );

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Database types
export interface User {
  id: string;
  username: string;
  password: string;
  email: string | null;
  verification_code: string | null;
  is_verified: boolean;
  created_at: string;
  last_activity: string;
  ip_address: string | null;
}

export interface FileUpload {
  id: string;
  filename: string;
  filesize: number;
  uploader_id: string | null;
  uploader_username: string | null;
  upload_date: string;
  delete_at: string | null;
  delete_duration: string;
  file_data: string;
  mime_type: string;
  unique_visitors: string[];
  download_count: number;
}

export interface RateLimit {
  id: string;
  ip: string;
  uploads: string[];
  banned_until: string | null;
}
