import { convertPdfToText } from "@/app/lib/ai/utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await convertPdfToText(buffer);

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return NextResponse.json({ error: "Failed to extract text from PDF." }, { status: 500 });
  }
}
