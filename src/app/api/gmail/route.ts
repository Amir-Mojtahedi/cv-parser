import { NextResponse } from "next/server";
import { getEmails } from "@/features/gmail/gmailService";

export async function GET() {
  try {
    const emails = await getEmails();
    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Failed to fetch emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
} 