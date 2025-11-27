// Supabase Storage utilities for file upload/download
import { supabaseAdmin } from './supabase';

export interface StorageUploadResult {
  success: boolean;
  storagePath?: string;
  publicUrl?: string;
  error?: string;
}

export interface StorageDeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 * @param fileId - Unique file ID
 * @param file - File object from FormData
 * @returns Upload result with storage path and public URL
 */
export async function uploadFileToStorage(
  fileId: string,
  file: File
): Promise<StorageUploadResult> {
  try {
    // Create a unique path: files/{fileId}/{original_filename}
    const storagePath = `${fileId}/${file.name}`;

    console.log(`Uploading to storage: ${storagePath}`);
    console.log(`File size: ${file.size} bytes, Type: ${file.type}`);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('files')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file to storage',
      };
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('files')
      .getPublicUrl(storagePath);

    console.log(`✅ File uploaded successfully: ${storagePath}`);
    console.log(`Public URL: ${urlData.publicUrl}`);

    return {
      success: true,
      storagePath,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Storage upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown storage error',
    };
  }
}

/**
 * Delete a file from Supabase Storage
 * @param storagePath - Path to file in storage bucket
 * @returns Delete result
 */
export async function deleteFileFromStorage(
  storagePath: string
): Promise<StorageDeleteResult> {
  try {
    console.log(`Deleting from storage: ${storagePath}`);

    const { error } = await supabaseAdmin.storage
      .from('files')
      .remove([storagePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete file from storage',
      };
    }

    console.log(`✅ File deleted successfully: ${storagePath}`);
    return { success: true };
  } catch (error) {
    console.error('Storage delete exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown storage error',
    };
  }
}

/**
 * Get public URL for a file in storage
 * @param storagePath - Path to file in storage bucket
 * @returns Public URL
 */
export function getStoragePublicUrl(storagePath: string): string {
  const { data } = supabaseAdmin.storage
    .from('files')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Download file from storage (for when we need the actual file data)
 * @param storagePath - Path to file in storage bucket
 * @returns File data as Blob
 */
export async function downloadFileFromStorage(
  storagePath: string
): Promise<{ data: Blob | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('files')
      .download(storagePath);

    if (error) {
      console.error('Storage download error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Storage download exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown storage error',
    };
  }
}
