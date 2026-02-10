import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getStoragePublicUrl } from '@/lib/storage';
import { mp4Exists, convertGifToMp4 } from '@/lib/gif-to-mp4';

/**
 * Serves an MP4 version of a GIF for Discord embeds.
 * Converts on first request and caches the result in Supabase Storage.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: file, error } = await supabase
    .from('files')
    .select('id, filename, mime_type, storage_path, uses_storage')
    .eq('id', id)
    .single();

  if (error || !file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  if (file.mime_type !== 'image/gif') {
    return NextResponse.json({ error: 'Not a GIF file' }, { status: 400 });
  }

  // Check if MP4 version already exists (cached from a previous conversion)
  const existingMp4Url = await mp4Exists(id);
  if (existingMp4Url) {
    return serveMp4(existingMp4Url);
  }

  // Get the original GIF URL
  let gifUrl: string;
  if (file.uses_storage && file.storage_path) {
    gifUrl = getStoragePublicUrl(file.storage_path);
  } else {
    // Legacy files: use the download endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://bunnybox.moe' : 'http://localhost:3000');
    gifUrl = `${baseUrl}/api/files/${id}/download`;
  }

  // Convert GIF to MP4 (lazy, first request only)
  const mp4Url = await convertGifToMp4(id, gifUrl);
  if (!mp4Url) {
    // Conversion failed — fall back to streaming the original GIF
    return NextResponse.json(
      { error: 'Conversion failed' },
      { status: 500 }
    );
  }

  return serveMp4(mp4Url);
}

async function serveMp4(mp4Url: string): Promise<NextResponse> {
  try {
    const response = await fetch(mp4Url);
    if (response.ok && response.body) {
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'video/mp4',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (e) {
    console.error('Failed to stream MP4:', e);
  }

  // Fall back to redirect
  return NextResponse.redirect(mp4Url, 302);
}
