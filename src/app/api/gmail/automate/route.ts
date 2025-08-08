import { NextResponse } from "next/server";
import { processNewEmails } from "@/features/llm-analyzer/services/gmailBotService";
import { getGmailBotResponses } from "@/features/database/redis";

export async function GET() {
  try {
    const responses = await getGmailBotResponses();
    return NextResponse.json({ 
      success: true, 
      history: responses,
      count: responses.length
    });
  } catch (error) {
    console.error("Error fetching automation data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const results = await processNewEmails();

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Error processing emails:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process emails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
