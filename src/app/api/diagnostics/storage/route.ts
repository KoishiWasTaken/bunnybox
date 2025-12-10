import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      storage: {
        configured: false,
        bucketExists: false,
        canCreateSignedUrl: false,
        canListFiles: false,
        error: null as string | null,
      },
      supabase: {
        connected: false,
        error: null as string | null,
      },
    };

    // Test Supabase connection
    try {
      const { data, error } = await supabaseAdmin
        .from('files')
        .select('id')
        .limit(1);

      diagnostics.supabase.connected = !error;
      if (error) {
        diagnostics.supabase.error = error.message;
      }
    } catch (error) {
      diagnostics.supabase.error = error instanceof Error ? error.message : String(error);
    }

    // Test Storage bucket
    try {
      // Check if bucket exists by trying to list files
      const { data: bucketData, error: bucketError } = await supabaseAdmin.storage
        .from('files')
        .list('', { limit: 1 });

      if (bucketError) {
        diagnostics.storage.error = bucketError.message;
      } else {
        diagnostics.storage.configured = true;
        diagnostics.storage.bucketExists = true;
        diagnostics.storage.canListFiles = true;
      }
    } catch (error) {
      diagnostics.storage.error = error instanceof Error ? error.message : String(error);
    }

    // Test signed URL creation
    try {
      const testPath = `test-${Date.now()}.txt`;
      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from('files')
        .createSignedUploadUrl(testPath);

      if (signedError) {
        diagnostics.storage.error = (diagnostics.storage.error || '') + '; ' + signedError.message;
      } else {
        diagnostics.storage.canCreateSignedUrl = true;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      diagnostics.storage.error = (diagnostics.storage.error || '') + '; ' + errorMsg;
    }

    // Overall health check
    const isHealthy = diagnostics.supabase.connected &&
                     diagnostics.storage.bucketExists &&
                     diagnostics.storage.canCreateSignedUrl;

    return NextResponse.json({
      healthy: isHealthy,
      diagnostics,
    });
  } catch (error) {
    console.error('Diagnostics error:', error);
    return NextResponse.json(
      {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
