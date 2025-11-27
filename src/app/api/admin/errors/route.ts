import { NextRequest, NextResponse } from 'next/server';
import { getErrorLogs } from '@/lib/error-logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'unresolved';

    const filters: {
      severity?: 'info' | 'warning' | 'error' | 'critical';
      resolved?: boolean;
      limit?: number;
    } = {};

    switch (filter) {
      case 'unresolved':
        filters.resolved = false;
        break;
      case 'critical':
        filters.severity = 'critical';
        filters.resolved = false;
        break;
      case 'all':
        // No filters
        break;
    }

    filters.limit = 100; // Limit to last 100 errors

    const { data: errors, error } = await getErrorLogs(filters);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch error logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ errors: errors || [] });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error logs' },
      { status: 500 }
    );
  }
}
