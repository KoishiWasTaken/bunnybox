import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';

  // Only intercept Discord's bot crawler
  if (!userAgent.includes('Discordbot')) {
    return NextResponse.next();
  }

  // Extract file ID from path
  const match = request.nextUrl.pathname.match(/^\/f\/([^/]+)$/);
  if (!match) {
    return NextResponse.next();
  }

  const fileId = match[1];

  // Query Supabase REST API directly to check if the file is embeddable media
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/files?id=eq.${encodeURIComponent(fileId)}&select=mime_type,storage_path,uses_storage`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.next();
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return NextResponse.next();
    }

    const file = data[0];
    const mimeType: string = file.mime_type || '';
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.next();
    }

    // For files in Supabase Storage, redirect directly to the public URL.
    // This is a single redirect to a URL that preserves the original filename
    // (e.g. ends in .gif, .png, .mp4), which Discord needs to properly
    // identify and render the media — especially animated GIFs.
    if (file.uses_storage && file.storage_path) {
      const storagePublicUrl = `${supabaseUrl}/storage/v1/object/public/files/${file.storage_path}`;
      return NextResponse.redirect(storagePublicUrl, 302);
    }

    // For legacy base64 files, redirect to the download endpoint which
    // serves the raw bytes directly (no further redirect).
    const downloadUrl = new URL(`/api/files/${fileId}/download`, request.url);
    downloadUrl.searchParams.set('embed', '1');
    return NextResponse.redirect(downloadUrl, 302);
  } catch {
    // On any failure, fall through to normal page rendering
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/f/:id',
};
