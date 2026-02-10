import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { supabaseAdmin } from './supabase';

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();
  // Load the WASM core from the npm package
  const coreURL = new URL(
    '@ffmpeg/core/dist/esm/ffmpeg-core.js',
    import.meta.url
  ).href;
  const wasmURL = new URL(
    '@ffmpeg/core/dist/esm/ffmpeg-core.wasm',
    import.meta.url
  ).href;

  await ffmpeg.load({ coreURL, wasmURL });
  return ffmpeg;
}

/**
 * Get the storage path for the MP4 version of a GIF.
 * Convention: same directory, "embed.mp4" filename.
 */
export function getMp4StoragePath(fileId: string): string {
  return `${fileId}/embed.mp4`;
}

/**
 * Check if an MP4 version already exists in Supabase Storage.
 */
export async function mp4Exists(fileId: string): Promise<string | null> {
  const mp4Path = getMp4StoragePath(fileId);
  const { data } = supabaseAdmin.storage
    .from('files')
    .getPublicUrl(mp4Path);

  // Try to HEAD the URL to check if it exists
  try {
    const res = await fetch(data.publicUrl, { method: 'HEAD' });
    if (res.ok) {
      return data.publicUrl;
    }
  } catch {
    // doesn't exist
  }
  return null;
}

/**
 * Convert a GIF to MP4 and upload to Supabase Storage.
 * Returns the public URL of the MP4, or null on failure.
 */
export async function convertGifToMp4(
  fileId: string,
  gifUrl: string
): Promise<string | null> {
  try {
    const ff = await getFFmpeg();

    // Download the GIF
    const gifData = await fetchFile(gifUrl);

    // Write the GIF to ffmpeg's virtual filesystem
    await ff.writeFile('input.gif', gifData);

    // Convert GIF to MP4:
    // - movflags faststart: metadata at beginning for streaming
    // - pix_fmt yuv420p: maximum player compatibility
    // - scale filter: ensure even dimensions (required by H.264)
    // - vsync vfr: preserve original GIF frame timing
    await ff.exec([
      '-i', 'input.gif',
      '-movflags', 'faststart',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-vsync', 'vfr',
      '-an',
      'output.mp4',
    ]);

    // Read the MP4 output
    const mp4Data = await ff.readFile('output.mp4');
    const mp4Buffer = mp4Data instanceof Uint8Array
      ? mp4Data
      : new TextEncoder().encode(mp4Data as string);

    // Clean up ffmpeg virtual filesystem
    await ff.deleteFile('input.gif');
    await ff.deleteFile('output.mp4');

    // Upload MP4 to Supabase Storage
    const mp4Path = getMp4StoragePath(fileId);
    const { error: uploadError } = await supabaseAdmin.storage
      .from('files')
      .upload(mp4Path, mp4Buffer, {
        contentType: 'video/mp4',
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) {
      console.error('Failed to upload MP4:', uploadError);
      return null;
    }

    // Return the public URL
    const { data } = supabaseAdmin.storage
      .from('files')
      .getPublicUrl(mp4Path);

    return data.publicUrl;
  } catch (error) {
    console.error('GIF to MP4 conversion failed:', error);
    return null;
  }
}
