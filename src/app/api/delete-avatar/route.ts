import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Only configure if all environment variables are available
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary environment variables are not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json({ error: 'No public ID provided' }, { status: 400 });
    }

    console.log('🗑️ Deleting avatar from Cloudinary - Original publicId:', publicId);

    // Try multiple public ID formats
    const formats = [
      publicId,
      publicId.replace(/\.[^/.]+$/, ""), // Without extension
      publicId.replace(/^akilhane-avatars\//, ''), // Remove folder prefix
      `akilhane-avatars/${publicId}`, // With folder
      `akilhane-avatars/${publicId.replace(/\.[^/.]+$/, "")}` // Folder + no extension
    ];

    let deleted = false;
    let successfulFormat = '';

    for (const format of formats) {
      try {
        console.log('🔍 Trying format:', format);
        
        const result = await cloudinary.uploader.destroy(format, {
          resource_type: 'image',
          type: 'upload'
        });

        console.log('📊 Cloudinary response:', result);

        if (result.result === 'ok' || result.result === 'deleted') {
          console.log('✅ Deleted successfully with format:', format);
          deleted = true;
          successfulFormat = format;
          break;
        }
      } catch (error) {
        console.log('❌ Failed format:', format, error);
      }
    }

    if (!deleted) {
      console.log('❌ All deletion attempts failed');
      return NextResponse.json(
        { error: 'All deletion attempts failed' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      deletedFormat: successfulFormat,
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    console.error('Avatar deletion error:', error);
    return NextResponse.json(
      { error: 'Deletion failed' }, 
      { status: 500 }
    );
  }
} 