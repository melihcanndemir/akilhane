import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test storage bucket existence and permissions
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to list buckets',
        details: bucketsError.message,
        timestamp: new Date().toISOString(),
      });
    }

    const userBackupsBucket = buckets?.find(bucket => bucket.name === 'user-backups');

    if (!userBackupsBucket) {
      return NextResponse.json({
        success: false,
        error: 'user-backups bucket not found',
        availableBuckets: buckets?.map(b => b.name) || [],
        timestamp: new Date().toISOString(),
      });
    }

    // Test upload to bucket (with dummy data)
    const testData = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test_${Date.now()}.txt`;

    const { error: uploadError } = await supabase.storage
      .from('user-backups')
      .upload(`test/${testFileName}`, testData);

    if (uploadError) {
      return NextResponse.json({
        success: false,
        error: 'Upload test failed',
        details: uploadError.message,
        bucketFound: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Clean up test file
    await supabase.storage
      .from('user-backups')
      .remove([`test/${testFileName}`]);

    return NextResponse.json({
      success: true,
      bucketFound: true,
      uploadTest: 'passed',
      bucketInfo: userBackupsBucket,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Storage test failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
