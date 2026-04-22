import { NextResponse } from "next/server";
import cloudinary from "../../lib/cloudinary";

interface CloudinaryResource {
  asset_id: string;
  secure_url: string;
  public_id: string;
  created_at: string;
  width: number;
  height: number;
}

export async function GET() {
  const hasCloudinaryCredentials =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

  if (!hasCloudinaryCredentials) {
    return NextResponse.json({
      data: [],
      error: "Gallery is temporarily unavailable",
    });
  }

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "admin_uploads/",
      max_results: 100,
    });

    const images = ((result.resources ?? []) as CloudinaryResource[])
      .filter((resource: CloudinaryResource) => typeof resource.secure_url === "string")
      .map((resource: CloudinaryResource) => ({
        asset_id: resource.asset_id,
        secure_url: resource.secure_url,
        public_id: resource.public_id,
        created_at: resource.created_at,
        width: resource.width,
        height: resource.height,
      }));

    return NextResponse.json({ data: images });
  } catch (error) {
    console.error("GALLERY API ERROR:", error);
    return NextResponse.json({
      data: [],
      error: "Failed to retrieve gallery images",
    });
  }
}
