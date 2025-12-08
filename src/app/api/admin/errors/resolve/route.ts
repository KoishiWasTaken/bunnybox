import { NextRequest, NextResponse } from 'next/server';
import { markErrorResolved } from '@/lib/error-logger';

export async function POST(request: NextRequest) {
  try {
    const { errorId } = await request.json();

    if (!errorId) {
      return NextResponse.json(
        { error: 'Error ID is required' },
        { status: 400 }
      );
    }

    const success = await markErrorResolved(errorId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark error as resolved' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking error as resolved:', error);
    return NextResponse.json(
      { error: 'Failed to mark error as resolved' },
      { status: 500 }
    );
  }
}
