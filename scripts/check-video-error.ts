import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkVideoError() {
  console.log('🔍 Searching for 20251210_113144.mp4 upload errors...\n');

  // Get all recent errors, focusing on upload-related ones
  const { data: errors, error } = await supabase
    .from('error_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) {
    console.error('❌ Failed to fetch errors:', error);
    return;
  }

  if (!errors || errors.length === 0) {
    console.log('✅ No error logs found!');
    return;
  }

  // Filter for upload/file errors
  const uploadErrors = errors.filter(e => 
    e.route?.includes('upload') || 
    e.route?.includes('file') ||
    e.error_message?.toLowerCase().includes('upload') ||
    e.error_message?.toLowerCase().includes('file') ||
    e.context?.filename?.includes('20251210_113144.mp4') ||
    e.context?.filename?.includes('.mp4')
  );

  console.log(`📊 Found ${uploadErrors.length} upload/file-related errors in last 50 logs:\n`);

  if (uploadErrors.length === 0) {
    console.log('⚠️  No upload errors found for the video file.');
    console.log('\nMost recent 10 errors of any type:');
    errors.slice(0, 10).forEach((err, i) => {
      console.log(`\n${i + 1}. [${err.severity}] ${new Date(err.timestamp).toLocaleString()}`);
      console.log(`   Route: ${err.route || 'Unknown'}`);
      console.log(`   Message: ${err.error_message}`);
      if (err.context) {
        console.log(`   Context:`, err.context);
      }
    });
    return;
  }

  uploadErrors.forEach((err, index) => {
    const time = new Date(err.timestamp).toLocaleString();
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Upload Error #${index + 1} - ${err.severity?.toUpperCase()}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🕐 Time: ${time}`);
    console.log(`📍 Route: ${err.route}`);
    console.log(`🔧 Method: ${err.method}`);
    console.log(`🚨 Error Type: ${err.error_type}`);
    console.log(`💬 Message: ${err.error_message}`);
    
    if (err.context) {
      console.log(`📦 Context:`, JSON.stringify(err.context, null, 2));
    }
    
    if (err.user_id) {
      console.log(`👤 User ID: ${err.user_id}`);
    }
    
    if (err.ip_address) {
      console.log(`🌐 IP: ${err.ip_address}`);
    }
    
    console.log(`✓ Resolved: ${err.resolved ? 'Yes' : 'No'}`);
    
    if (err.error_stack) {
      console.log(`\n📜 Stack trace (first 300 chars):`);
      console.log(err.error_stack.substring(0, 300) + '...');
    }
  });
}

checkVideoError();
