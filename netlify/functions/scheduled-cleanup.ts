import type { Config } from "@netlify/functions";

const handler = async () => {
  try {
    console.log('Starting scheduled cleanup...');

    // Get the site URL from environment or construct it
    const siteUrl = process.env.URL || 'https://bunbox.netlify.app';
    const cleanupKey = process.env.CLEANUP_API_KEY || 'default-cleanup-key';

    // Call the cleanup API endpoint
    const response = await fetch(`${siteUrl}/api/cleanup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanupKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Cleanup API returned ${response.status}`);
    }

    const data = await response.json();

    console.log('Cleanup completed successfully:', {
      deletedFiles: data.deletedFiles,
      deletedOrphanedFiles: data.deletedOrphanedFiles,
      deletedAccounts: data.deletedAccounts,
      timestamp: data.timestamp
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Cleanup completed successfully',
        ...data
      })
    };
  } catch (error) {
    console.error('Scheduled cleanup error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Cleanup failed'
      })
    };
  }
};

// Schedule to run daily at 2:00 AM UTC
export const config: Config = {
  schedule: "0 2 * * *"
};

export default handler;
