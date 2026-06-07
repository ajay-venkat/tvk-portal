import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads directory exists on disk
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate clean, collision-free filename
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const ext = path.extname(sanitizedOriginal) || ".jpg";
    const base = path.basename(sanitizedOriginal, ext);
    const uniqueName = `${base}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    
    const filePath = path.join(uploadsDir, uniqueName);

    // Write file to workspace public assets folder
    fs.writeFileSync(filePath, buffer);

    // Return the path that Next.js serves publicly
    const url = `/uploads/${uniqueName}`;
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Local file upload API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

