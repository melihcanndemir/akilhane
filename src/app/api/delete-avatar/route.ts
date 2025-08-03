import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary environment variables are not configured");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { error: "No public ID provided" },
        { status: 400 },
      );
    }

    // Try multiple public ID formats
    const formats = [
      publicId,
      publicId.replace(/\.[^/.]+$/, ""), // Without extension
      publicId.replace(/^akilhane-avatars\//, ""), // Remove folder prefix
      `akilhane-avatars/${publicId}`, // With folder
      `akilhane-avatars/${publicId.replace(/\.[^/.]+$/, "")}`, // Folder + no extension
    ];

    let deleted = false;
    let successfulFormat = "";

    for (const format of formats) {
      try {
        const result = await cloudinary.uploader.destroy(format, {
          resource_type: "image",
          type: "upload",
        });

        if (result.result === "ok" || result.result === "deleted") {
          deleted = true;
          successfulFormat = format;
          break;
        }
      } catch {
        // Do nothing
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { error: "All deletion attempts failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      deletedFormat: successfulFormat,
      message: "Avatar deleted successfully",
    });
  } catch {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
