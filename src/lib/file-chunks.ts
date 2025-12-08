// File chunking utilities for handling large file storage

import { supabaseAdmin } from './supabase';

// Chunk size: 10MB in base64 (conservative, well below any limits)
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Split a base64 string into chunks
 */
export function splitIntoChunks(base64Data: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < base64Data.length; i += CHUNK_SIZE) {
    chunks.push(base64Data.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

/**
 * Store file data as chunks in the database
 */
export async function storeFileChunks(
  fileId: string,
  base64Data: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const chunks = splitIntoChunks(base64Data);

    console.log(`Storing file ${fileId} in ${chunks.length} chunks`);

    // Insert all chunks
    const chunksToInsert = chunks.map((chunkData, index) => ({
      file_id: fileId,
      chunk_index: index,
      chunk_data: chunkData,
    }));

    const { error } = await supabaseAdmin
      .from('file_chunks')
      .insert(chunksToInsert);

    if (error) {
      console.error('Error storing chunks:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception storing chunks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to store chunks'
    };
  }
}

/**
 * Retrieve and reassemble file chunks from the database
 */
export async function retrieveFileChunks(
  fileId: string
): Promise<{ data: string | null; error?: string }> {
  try {
    const { data: chunks, error } = await supabaseAdmin
      .from('file_chunks')
      .select('chunk_index, chunk_data')
      .eq('file_id', fileId)
      .order('chunk_index', { ascending: true });

    if (error) {
      console.error('Error retrieving chunks:', error);
      return { data: null, error: error.message };
    }

    if (!chunks || chunks.length === 0) {
      return { data: null, error: 'No chunks found for this file' };
    }

    // Reassemble chunks in order
    const base64Data = chunks.map(chunk => chunk.chunk_data).join('');

    console.log(`Retrieved and reassembled ${chunks.length} chunks for file ${fileId}`);

    return { data: base64Data };
  } catch (error) {
    console.error('Exception retrieving chunks:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to retrieve chunks'
    };
  }
}

/**
 * Delete file chunks (called when deleting a file)
 * Note: CASCADE delete should handle this automatically, but this is a fallback
 */
export async function deleteFileChunks(
  fileId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('file_chunks')
      .delete()
      .eq('file_id', fileId);

    if (error) {
      console.error('Error deleting chunks:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception deleting chunks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete chunks'
    };
  }
}

/**
 * Check if a file should be chunked based on its base64 size
 */
export function shouldChunkFile(base64Data: string): boolean {
  return base64Data.length > CHUNK_SIZE;
}

/**
 * Get the number of chunks needed for a base64 string
 */
export function getChunkCount(base64Data: string): number {
  return Math.ceil(base64Data.length / CHUNK_SIZE);
}
