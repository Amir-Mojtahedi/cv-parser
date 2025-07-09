import { convertPdfToText } from "@/app/lib/ai/utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl } = body;

    if (!fileUrl || typeof fileUrl !== "string") {
      return NextResponse.json({ error: "No file URL provided." }, { status: 400 });
    }

    const text = await convertPdfToText(fileUrl);

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return NextResponse.json({ error: "Failed to extract text from PDF." }, { status: 500 });
  }
}
