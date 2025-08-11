import { NextResponse } from "next/server";
import { processNewEmails } from "@/features/llm-analyzer/services/gmailBotService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const companyContext = body.companyContext;
    // Verify the request is from an authorized source (optional security)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const results = await processNewEmails(companyContext);
    
    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      timestamp: new Date().toISOString(),
      results 
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Cron job failed",
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "Gmail automation cron endpoint is running",
    timestamp: new Date().toISOString()
  });
} 