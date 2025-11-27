#!/usr/bin/env bun

/**
 * Manual Cleanup Script
 * Run this script to manually trigger cleanup of expired files and inactive accounts
 * 
 * Usage: bun run scripts/manual-cleanup.ts
 */

const CLEANUP_API_KEY = process.env.CLEANUP_API_KEY || 'default-cleanup-key';
const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runCleanup() {
  console.log('🧹 Starting manual cleanup...\n');
  console.log(`📍 API URL: ${API_URL}`);
  console.log(`🔑 Using cleanup key: ${CLEANUP_API_KEY.substring(0, 10)}...\n`);

  try {
    const response = await fetch(`${API_URL}/api/cleanup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLEANUP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Cleanup API returned ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    console.log('✅ Cleanup completed successfully!\n');
    console.log('📊 Results:');
    console.log(`   - Expired files deleted: ${data.deletedFiles}`);
    console.log(`   - Orphaned/failed uploads deleted: ${data.deletedOrphanedFiles}`);
    console.log(`   - Inactive accounts deleted: ${data.deletedAccounts}`);
    console.log(`   - Timestamp: ${new Date(data.timestamp).toLocaleString()}\n`);

    const totalDeleted = data.deletedFiles + data.deletedOrphanedFiles + data.deletedAccounts;
    if (totalDeleted === 0) {
      console.log('ℹ️  Database is clean - no expired files, orphaned uploads, or inactive accounts found.');
    } else {
      console.log(`🎉 Total items cleaned: ${totalDeleted}`);
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the cleanup
runCleanup();
