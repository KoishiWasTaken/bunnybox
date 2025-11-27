import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch file info server-side for meta tags
    const { data: file } = await supabase
      .from('files')
      .select('filename, filesize, mime_type, uploader_username')
      .eq('id', id)
      .single();

    if (!file) {
      return {
        title: 'File Not Found | bunnybox',
        description: 'The requested file could not be found.',
      };
    }

    const isImage = file.mime_type?.startsWith('image/');
    const isVideo = file.mime_type?.startsWith('video/');
    const isAudio = file.mime_type?.startsWith('audio/');

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    (process.env.NODE_ENV === 'production' ? 'https://bunnybox.moe' : 'http://localhost:3000');
    const fileUrl = `${baseUrl}/f/${id}`;
    const downloadUrl = `${baseUrl}/api/files/${id}/download`;

    // Format file size
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const description = `${file.filename} • Uploaded by ${file.uploader_username || 'Anonymous'} • ${formatBytes(file.filesize)}`;

    // Base metadata
    const metadata: Metadata = {
      title: `${file.filename} | bunnybox`,
      description,
      openGraph: {
        title: file.filename,
        description,
        url: fileUrl,
        siteName: 'bunnybox',
        type: 'website',
      },
      twitter: {
        card: isImage ? 'summary_large_image' : 'summary',
        title: file.filename,
        description,
      },
    };

    // Add media-specific Open Graph tags
    if (isImage) {
      metadata.openGraph = {
        ...metadata.openGraph,
        images: [
          {
            url: downloadUrl,
            alt: file.filename,
          },
        ],
      };
      if (metadata.twitter) {
        metadata.twitter = {
          ...metadata.twitter,
          images: [downloadUrl],
        };
      }
    } else if (isVideo) {
      metadata.openGraph = {
        ...metadata.openGraph,
        videos: [
          {
            url: downloadUrl,
            type: file.mime_type,
          },
        ],
      };
    } else if (isAudio) {
      metadata.openGraph = {
        ...metadata.openGraph,
        audio: [
          {
            url: downloadUrl,
            type: file.mime_type,
          },
        ],
      };
    }

    return metadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'bunnybox',
      description: 'File hosting for bunnies :3',
    };
  }
}

export default function FileLayout({ children }: Props) {
  return <>{children}</>;
}
