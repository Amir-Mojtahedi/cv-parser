import { NextResponse } from "next/server";
import { processNewEmails } from "@/features/llm-analyzer/services/gmailBotService";
import { getGmailBotResponses } from "@/features/database/redis";

export async function GET() {
  try {
    const responses = await getGmailBotResponses();
    return NextResponse.json({
      success: true,
      history: responses,
    });
  } catch (error) {
    console.error("Error fetching automation data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyContext } = body;

    if (!companyContext || typeof companyContext !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid companyContext" },
        { status: 400 }
      );
    }

    const results = await processNewEmails(companyContext);

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
