// Error logging utility for automatic error tracking and troubleshooting

import { supabaseAdmin } from './supabase';
import { NextRequest } from 'next/server';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorLogContext {
  fileId?: string;
  filename?: string;
  fileSize?: number;
  operation?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ErrorLogOptions {
  error: Error | unknown;
  severity?: ErrorSeverity;
  route?: string;
  method?: string;
  userId?: string | null;
  request?: NextRequest;
  context?: ErrorLogContext;
}

/**
 * Log an error to the database for later review
 * Wrapped in try-catch to ensure logging errors don't break the application
 */
export async function logError(options: ErrorLogOptions): Promise<void> {
  try {
    const {
      error,
      severity = 'error',
      route,
      method,
      userId,
      request,
      context
    } = options;

    // Extract error details
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorType = errorObj.name || 'UnknownError';
    const errorMessage = errorObj.message || String(error);
    const errorStack = errorObj.stack || null;

    // Extract request details if available
    let ipAddress: string | null = null;
    let userAgent: string | null = null;
    let requestBody: string | null = null;

    if (request) {
      ipAddress = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown';
      userAgent = request.headers.get('user-agent') || null;

      // Try to get request body (safely)
      try {
        if (request.method === 'POST' || request.method === 'PUT') {
          const clonedRequest = request.clone();
          const contentType = request.headers.get('content-type');

          if (contentType?.includes('application/json')) {
            const body = await clonedRequest.json();
            // Sanitize sensitive data
            const sanitized = sanitizeRequestBody(body);
            requestBody = JSON.stringify(sanitized);
          } else if (contentType?.includes('multipart/form-data')) {
            requestBody = '[FormData - not logged for size reasons]';
          }
        }
      } catch (e) {
        // Ignore body extraction errors
        requestBody = '[Could not extract request body]';
      }
    }

    // Insert error log into database
    const { error: insertError } = await supabaseAdmin
      .from('error_logs')
      .insert({
        timestamp: new Date().toISOString(),
        error_type: errorType,
        error_message: errorMessage,
        error_stack: errorStack,
        route: route || null,
        method: method || null,
        user_id: userId || null,
        ip_address: ipAddress,
        user_agent: userAgent,
        request_body: requestBody,
        context: context || null,
        severity: severity,
        resolved: false,
      });

    if (insertError) {
      // If we can't log to database, log to console
      console.error('Failed to insert error log to database:', insertError);
      console.error('Original error:', errorMessage);
    } else {
      console.log(`✅ Error logged: [${severity}] ${errorType} - ${errorMessage}`);
    }
  } catch (loggingError) {
    // If error logging itself fails, just log to console
    console.error('Error logging failed:', loggingError);
    console.error('Original error:', options.error);
  }
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeRequestBody(body: Record<string, unknown>): Record<string, unknown> {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Convenience function for logging info-level messages
 */
export async function logInfo(
  message: string,
  options?: Omit<ErrorLogOptions, 'error' | 'severity'>
): Promise<void> {
  return logError({
    error: new Error(message),
    severity: 'info',
    ...options,
  });
}

/**
 * Convenience function for logging warnings
 */
export async function logWarning(
  message: string,
  options?: Omit<ErrorLogOptions, 'error' | 'severity'>
): Promise<void> {
  return logError({
    error: new Error(message),
    severity: 'warning',
    ...options,
  });
}

/**
 * Convenience function for logging critical errors
 */
export async function logCritical(
  error: Error | unknown,
  options?: Omit<ErrorLogOptions, 'error' | 'severity'>
): Promise<void> {
  return logError({
    error,
    severity: 'critical',
    ...options,
  });
}

/**
 * Get error logs from database for review
 */
export async function getErrorLogs(filters?: {
  severity?: ErrorSeverity;
  resolved?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabaseAdmin
      .from('error_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.resolved !== undefined) {
      query = query.eq('resolved', filters.resolved);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch error logs:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return { data: null, error };
  }
}

/**
 * Mark an error log as resolved
 */
export async function markErrorResolved(errorId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('error_logs')
      .update({ resolved: true })
      .eq('id', errorId);

    if (error) {
      console.error('Failed to mark error as resolved:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking error as resolved:', error);
    return false;
  }
}

/**
 * Clean up old resolved errors (older than 30 days)
 */
export async function cleanupOldErrors(): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabaseAdmin
      .from('error_logs')
      .delete()
      .eq('resolved', true)
      .lt('timestamp', thirtyDaysAgo.toISOString())
      .select();

    if (error) {
      console.error('Failed to cleanup old errors:', error);
      return 0;
    }

    const deletedCount = data?.length || 0;
    console.log(`Cleaned up ${deletedCount} old error logs`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old errors:', error);
    return 0;
  }
}
