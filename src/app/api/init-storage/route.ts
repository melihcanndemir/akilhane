import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Check if bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const existingBucket = buckets?.find(bucket => bucket.name === 'user-backups');

    if (existingBucket) {
      return NextResponse.json({
        success: true,
        message: 'user-backups bucket already exists',
        bucket: existingBucket,
        timestamp: new Date().toISOString(),
      });
    }

    // Create the bucket as PUBLIC for now (easier setup)
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('user-backups', {
      public: true, // Temporarily public for easier testing
      allowedMimeTypes: ['application/json'],
      fileSizeLimit: 10485760, // 10MB limit
    });

    if (createError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create bucket',
        details: createError.message,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'user-backups bucket created successfully as PUBLIC',
      bucket: newBucket,
      warning: 'Bucket is currently PUBLIC. For production, make it private and set up RLS policies.',
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: 'Storage initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
