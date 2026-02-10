import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle extension-based URLs: /f/{id}.{ext} (e.g., /f/abc123.gif)
  // These serve the raw file directly. Discord's client recognizes the
  // file extension and embeds media natively — animating GIFs, showing
  // images frameless, playing videos inline.
  const extMatch = pathname.match(/^\/f\/([^/.]+)\.\w+$/);
  if (extMatch) {
    const fileId = extMatch[1];
    const downloadUrl = new URL(`/api/files/${fileId}/download`, request.url);
    downloadUrl.searchParams.set('embed', '1');
    return NextResponse.rewrite(downloadUrl);
  }

  // For /f/{id} URLs (no extension), only intercept Discord's bot
  const userAgent = request.headers.get('user-agent') || '';
  if (!userAgent.includes('Discordbot')) {
    return NextResponse.next();
  }

  // Extract file ID from path
  const match = pathname.match(/^\/f\/([^/]+)$/);
  if (!match) {
    return NextResponse.next();
  }

  const fileId = match[1];

  // Query Supabase REST API to check if the file is embeddable media
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
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.next();
    }

    // Rewrite to the download endpoint so Discord receives raw file bytes
    const downloadUrl = new URL(`/api/files/${fileId}/download`, request.url);
    downloadUrl.searchParams.set('embed', '1');
    return NextResponse.rewrite(downloadUrl);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/f/:id*',
};
