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

    if (!isImage && !isVideo) {
      return NextResponse.next();
    }

    // GIFs are handled via og:video tags in the layout (pointing to an
    // MP4 version), so let the page HTML through for Discord to parse.
    if (isGif) {
      return NextResponse.next();
    }

    // Rewrite (NOT redirect) to the download endpoint so Discord receives
    // raw file bytes directly from the /f/{id} URL itself. A redirect would
    // cause Discord to only show the first frame of GIFs. With a rewrite,
    // the download endpoint streams the file and Discord sees it as a direct
    // media response — rendering images, videos, and GIFs frameless.
    const downloadUrl = new URL(`/api/files/${fileId}/download`, request.url);
    downloadUrl.searchParams.set('embed', '1');
    return NextResponse.rewrite(downloadUrl);
  } catch {
    // On any failure, fall through to normal page rendering
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/f/:id',
};
