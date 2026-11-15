import { NextRequest, NextResponse } from "next/server";
import { uploadWhatsAppMedia } from "@/lib/whatsapp";

const allowed = new Set([
  "image/jpeg", "image/png",
  "video/mp4", "video/3gpp",
  "application/pdf"
]);

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }
    if (!allowed.has(file.type)) {
      return NextResponse.json({ error: `Unsupported media type: ${file.type}. Use JPG, PNG, MP4, 3GP or PDF.` }, { status: 400 });
    }

    const result = await uploadWhatsAppMedia(file);
    return NextResponse.json({ mediaId: result.id, type: file.type, name: file.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, meta: error.meta || null }, { status: 500 });
  }
}
