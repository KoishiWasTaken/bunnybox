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
      `${supabaseUrl}/rest/v1/files?id=eq.${encodeURIComponent(fileId)}&select=mime_type`,
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

    const mimeType: string = data[0].mime_type || '';
    const isGif = mimeType === 'image/gif';
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    // GIFs need the og:video approach (handled in layout.tsx) to animate
    // on Discord. Redirecting to the raw file only shows the first frame.
    // Non-GIF images and videos can be redirected to the raw file for
    // frameless embedding.
    if (isGif || (!isImage && !isVideo)) {
      return NextResponse.next();
    }

    // Redirect Discord's bot to the raw file download.
    // Discord follows the redirect, sees raw media bytes with the correct
    // Content-Type, and embeds it frameless — just like a direct image/video URL.
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
