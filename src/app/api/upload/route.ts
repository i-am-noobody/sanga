// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "../../lib/cloudinary";
import { getUser } from "../../lib/getUser";

export async function GET() {
  try {
    // 🔐 Get user from cookie
    const user = await getUser();

    // ❌ Not logged in
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ❌ Not admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ☁️ Get all resources from Cloudinary folder
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "admin_uploads/",
      max_results: 100, // Adjust as needed
    });

    return NextResponse.json({
      message: "Images retrieved successfully",
      data: result.resources,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to retrieve images" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 Get user from cookie
    const user = await getUser();

    // ❌ Not logged in
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ❌ Not admin 
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 📦 Get file
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
    }

    // 🔁 Convert to buffer and base64 for Cloudinary upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64 = fileBuffer.toString("base64");
    const dataUri = `data:${file.type || "application/octet-stream"};base64,${base64}`;
 console.log(dataUri)
    // ☁️ Upload to Cloudinary using upload() for stable result
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "admin_uploads",
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return NextResponse.json({
      message: "Upload successful",
      data: uploadResult,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}