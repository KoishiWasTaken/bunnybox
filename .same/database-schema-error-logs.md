# Error Logs Table Schema

## Overview

This table stores all application errors for troubleshooting and monitoring.

## Table: error_logs

```sql
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

CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
```

## Migration SQL

Run this in Supabase Dashboard → SQL Editor:

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

-- Create indexes for faster queries
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

## Fields

- **id**: Unique identifier for each error log
- **timestamp**: When the error occurred
- **error_type**: Type/name of error (e.g., "ValidationError", "DatabaseError")
- **error_message**: Human-readable error message
- **error_stack**: Full stack trace for debugging
- **route**: API route or page where error occurred
- **method**: HTTP method (GET, POST, etc.)
- **user_id**: ID of user who triggered the error (if authenticated)
- **ip_address**: IP address of requester
- **user_agent**: Browser/client user agent
- **request_body**: Request payload (sanitized)
- **context**: Additional context as JSON (file details, operation type, etc.)
- **severity**: Error severity (info, warning, error, critical)
- **resolved**: Whether the error has been reviewed/fixed
- **created_at**: Record creation time

## Severity Levels

- **info**: Informational, not an error but logged for tracking
- **warning**: Potential issue, doesn't prevent operation
- **error**: Error occurred but was handled gracefully
- **critical**: Severe error, operation failed completely

## Cleanup

Old error logs can be cleaned up automatically:

```sql
-- Delete error logs older than 30 days
DELETE FROM error_logs
WHERE timestamp < NOW() - INTERVAL '30 days'
AND resolved = true;
```
