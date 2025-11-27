-- Add email rate limiting columns to users table
-- This migration adds fields to track email sending for verification and password reset

-- Add columns for verification email rate limiting
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_email_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_email_last_sent TIMESTAMP,
ADD COLUMN IF NOT EXISTS reset_email_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reset_email_last_sent TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN users.verification_email_count IS 'Total number of verification emails sent (max 5)';
COMMENT ON COLUMN users.verification_email_last_sent IS 'Timestamp of last verification email sent (30-second cooldown)';
COMMENT ON COLUMN users.reset_email_count IS 'Total number of password reset emails sent (max 5)';
COMMENT ON COLUMN users.reset_email_last_sent IS 'Timestamp of last password reset email sent (30-second cooldown)';
