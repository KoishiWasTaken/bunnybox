import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Helper function to generate unique 8-character file ID
function generateFileId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Generate unique file ID
    let fileId = generateFileId();
    let isUnique = false;

    while (!isUnique) {
      const { data: existing } = await supabaseAdmin
        .from('files')
        .select('id')
        .eq('id', fileId)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        fileId = generateFileId();
      }
    }

    // Create storage path
    const storagePath = `${fileId}/${filename}`;

    // Create a signed upload URL (expires in 10 minutes)
    const { data, error } = await supabaseAdmin.storage
      .from('files')
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error('Failed to create signed upload URL:', error);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      fileId,
      storagePath,
      signedUrl: data.signedUrl,
      token: data.token,
    });
  } catch (error) {
    console.error('Get upload URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
