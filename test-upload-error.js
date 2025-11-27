// Test script to simulate what happens with an 11MB upload
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStorageUpload() {
  console.log('Testing storage upload with 11MB simulated file...\n');
  
  // Create a simulated 11MB buffer
  const size = 11 * 1024 * 1024; // 11MB
  const buffer = Buffer.alloc(size, 'a');
  
  console.log(`Created test buffer: ${size} bytes (${(size / 1024 / 1024).toFixed(2)}MB)`);
  
  const testPath = `test-upload-${Date.now()}/test-11mb.bin`;
  
  console.log(`\nAttempting upload to: ${testPath}`);
  
  const { data, error } = await supabase.storage
    .from('files')
    .upload(testPath, buffer, {
      contentType: 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    console.error('❌ Upload FAILED:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return;
  }
  
  console.log('✅ Upload SUCCEEDED!');
  console.log('Path:', data.path);
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('files')
    .getPublicUrl(testPath);
  
  console.log('Public URL:', urlData.publicUrl);
  
  // Clean up test file
  console.log('\nCleaning up test file...');
  await supabase.storage.from('files').remove([testPath]);
  console.log('✅ Test file removed');
}

testStorageUpload().catch(console.error);
