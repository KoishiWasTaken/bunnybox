'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface ErrorLog {
  id: string;
  timestamp: string;
  error_type: string;
  error_message: string;
  error_stack: string | null;
  route: string | null;
  method: string | null;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  request_body: string | null;
  context: Record<string, unknown> | null;
  severity: string;
  resolved: boolean;
  created_at: string;
}

export default function ErrorLogsPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical'>('unresolved');
  const [expandedError, setExpandedError] = useState<string | null>(null);

  useEffect(() => {
    fetchErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/errors?filter=${filter}`);
      const data = await response.json();
      if (data.errors) {
        setErrors(data.errors);
      }
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (errorId: string) => {
    try {
      const response = await fetch('/api/admin/errors/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorId }),
      });

      if (response.ok) {
        fetchErrors(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'error':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'info':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-black dark:text-white bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bunny-gradient">
      <Navigation />

      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
            Error Logs
          </h1>
          <p className="text-black dark:text-white">
            Review and troubleshoot application errors
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setFilter('unresolved')}
            className={`${
              filter === 'unresolved'
                ? 'bg-pink-500 text-white'
                : 'bg-white/80 dark:bg-black/30 text-gray-800 dark:text-gray-200'
            }`}
          >
            Unresolved
          </Button>
          <Button
            onClick={() => setFilter('critical')}
            className={`${
              filter === 'critical'
                ? 'bg-red-500 text-white'
                : 'bg-white/80 dark:bg-black/30 text-gray-800 dark:text-gray-200'
            }`}
          >
            Critical
          </Button>
          <Button
            onClick={() => setFilter('all')}
            className={`${
              filter === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-white/80 dark:bg-black/30 text-gray-800 dark:text-gray-200'
            }`}
          >
            All
          </Button>
        </div>

        {/* Error List */}
        {loading ? (
          <Card className="bunny-card p-8 text-center">
            <p className="text-black dark:text-white">Loading errors...</p>
          </Card>
        ) : errors.length === 0 ? (
          <Card className="bunny-card p-8 text-center">
            <p className="text-black dark:text-white">
              No errors found. Great job! 🎉
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {errors.map((error) => (
              <Card key={error.id} className="bunny-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(
                          error.severity
                        )}`}
                      >
                        {error.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-black dark:text-white">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                      {error.resolved && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-xs font-bold">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                      {error.error_type}
                    </h3>
                    <p className="text-black dark:text-white mb-2">
                      {error.error_message}
                    </p>
                    <div className="flex gap-4 text-sm text-black dark:text-white">
                      {error.route && <span>Route: {error.route}</span>}
                      {error.method && <span>Method: {error.method}</span>}
                      {error.ip_address && <span>IP: {error.ip_address}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setExpandedError(expandedError === error.id ? null : error.id)
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2"
                    >
                      {expandedError === error.id ? 'Hide' : 'Details'}
                    </Button>
                    {!error.resolved && (
                      <Button
                        onClick={() => markAsResolved(error.id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedError === error.id && (
                  <div className="mt-4 space-y-4 border-t border-pink-200 dark:border-pink-900/30 pt-4">
                    {error.error_stack && (
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                          Stack Trace:
                        </h4>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl overflow-auto text-xs text-gray-800 dark:text-gray-200">
                          {error.error_stack}
                        </pre>
                      </div>
                    )}

                    {error.context && Object.keys(error.context).length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                          Context:
                        </h4>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl overflow-auto text-xs text-gray-800 dark:text-gray-200">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </div>
                    )}

                    {error.request_body && (
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                          Request Body:
                        </h4>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl overflow-auto text-xs text-gray-800 dark:text-gray-200">
                          {error.request_body}
                        </pre>
                      </div>
                    )}

                    {error.user_agent && (
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                          User Agent:
                        </h4>
                        <p className="text-sm text-black dark:text-white">
                          {error.user_agent}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
