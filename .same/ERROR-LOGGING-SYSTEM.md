# Error Logging System Documentation

## Overview

The error logging system automatically captures, stores, and tracks all errors that occur in the application. This helps with troubleshooting, monitoring, and improving the application.

## Features

✅ **Automatic Error Capture** - All errors are automatically logged
✅ **Detailed Context** - Includes stack traces, request details, IP addresses, and custom metadata
✅ **Severity Levels** - Categorize errors as info, warning, error, or critical
✅ **Admin Dashboard** - View and manage errors at `/admin/errors`
✅ **Error Resolution** - Mark errors as resolved after fixing
✅ **Automatic Cleanup** - Old resolved errors are deleted after 30 days
✅ **Search & Filter** - Filter by severity, resolution status

## Setup

### 1. Create the error_logs table

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Create error_logs table
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  route TEXT,
  method TEXT,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  request_body TEXT,
  context JSONB,
  severity TEXT DEFAULT 'error',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Service role can manage all error logs
CREATE POLICY "Service role can manage error logs"
ON error_logs FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- No public access
CREATE POLICY "No public access to error logs"
ON error_logs FOR ALL TO anon
USING (false);
```

### 2. That's it!

The error logging system is already integrated into all API routes. No additional configuration needed.

## Usage

### Logging Errors in Code

The error logging is already integrated into all API routes, but you can also use it manually:

```typescript
import { logError, logWarning, logInfo, logCritical } from '@/lib/error-logger';

// Log an error
await logError({
  error: new Error('Something went wrong'),
  severity: 'error',
  route: '/api/my-route',
  method: 'POST',
  userId: user?.id,
  request,
  context: {
    customField: 'value',
    fileId: 'abc123',
  },
});

// Convenience functions
await logWarning('Potential issue detected', { route: '/api/...' });
await logInfo('Important event', { route: '/api/...' });
await logCritical(error, { route: '/api/...' });
```

### Viewing Error Logs

1. Go to `/admin/errors` in your browser
2. Filter by:
   - **Unresolved** - Show only errors that haven't been fixed
   - **Critical** - Show only critical severity errors
   - **All** - Show all errors
3. Click **Details** to see full stack trace, context, and request details
4. Click **Resolve** to mark an error as fixed

### Error Severity Levels

- **info** (blue) - Informational, not an error but logged for tracking
- **warning** (yellow) - Potential issue, doesn't prevent operation
- **error** (orange) - Error occurred but was handled gracefully
- **critical** (red) - Severe error, operation failed completely

## What Gets Logged

Each error log includes:

- **Timestamp** - When the error occurred
- **Error Type** - Name of the error (e.g., "ValidationError")
- **Error Message** - Human-readable description
- **Stack Trace** - Full stack trace for debugging
- **Route** - API route or page where error occurred
- **Method** - HTTP method (GET, POST, etc.)
- **User ID** - If user was authenticated
- **IP Address** - Requester's IP
- **User Agent** - Browser/client information
- **Request Body** - Sanitized request payload (passwords redacted)
- **Context** - Custom metadata (file details, operation type, etc.)
- **Severity** - Error severity level
- **Resolved** - Whether error has been reviewed/fixed

## Where Errors Are Logged

Errors are automatically logged in:

✅ **Auth Routes**
- `/api/auth/signin` - Failed logins, database errors
- `/api/auth/signup` - Account creation failures

✅ **Upload Route**
- `/api/files/upload` - File conversion errors, database errors, chunk storage failures

✅ **All Other Routes**
- Any route can use the error logger

## Automatic Cleanup

The scheduled cleanup job (`/api/cleanup`) automatically:
- Deletes resolved errors older than 30 days
- Keeps unresolved errors indefinitely for review
- Runs on schedule (via Netlify scheduled functions)

## Privacy & Security

🔒 **Sensitive Data Protection**
- Passwords are redacted from request bodies
- Tokens and secrets are sanitized
- Only service role can access error logs

🔒 **No Public Access**
- Error logs table has RLS enabled
- Only admin users can view errors
- No public API endpoints

## Troubleshooting

### Error logs not appearing?

1. Check if error_logs table exists in Supabase
2. Verify RLS policies are set up correctly
3. Check service role key is configured in .env.local
4. Look for "Error logging failed" messages in console

### Can't view error logs?

1. Make sure you're accessing `/admin/errors`
2. Check browser console for API errors
3. Verify error_logs table permissions

### Too many error logs?

1. Fix the underlying issues causing errors
2. Mark old errors as resolved
3. Wait for automatic cleanup (30 days)
4. Or manually delete old logs from Supabase dashboard

## Example: Viewing an Error

When you visit `/admin/errors`, you might see:

```
🔴 CRITICAL                                    Nov 25, 2025 2:30 PM
Database insert error
Failed to save file to database.

Route: /api/files/upload
Method: POST
IP: 192.168.1.1

[Details] [Resolve]

--- Details Expanded ---
Stack Trace:
  Error: Failed to save file to database
    at POST (/api/files/upload/route.ts:305)
    at ...

Context:
{
  "fileId": "AbCd1234",
  "filename": "test.pdf",
  "fileSize": 5242880,
  "operation": "database_insert"
}
```

## Benefits

📊 **Better Monitoring** - See all errors in one place
🐛 **Easier Debugging** - Full stack traces and context
📈 **Trend Analysis** - Identify recurring issues
🔧 **Quick Fixes** - Know exactly what broke and why
✅ **Track Progress** - Mark errors as resolved

## Next Steps

1. Run the SQL migration to create error_logs table
2. Generate some errors by trying to upload files without env vars set
3. Visit `/admin/errors` to see the logged errors
4. Mark errors as resolved after fixing issues
5. Monitor error trends over time
