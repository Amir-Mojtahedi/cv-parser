"use client";

import { useEffect } from "react";

export function ServiceWakeup() {
  useEffect(() => {
    const wakeUpFileParserService = async () => {
      const fileParserUrl = process.env.NEXT_PUBLIC_FILE_PARSER_URL;

      if (!fileParserUrl) {
        console.warn("NEXT_PUBLIC_FILE_PARSER_URL not configured");
        return;
      }

      try {
        console.log("🚀 Waking up file parser service...");
        const response = await fetch(`${fileParserUrl}/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log("✅ File parser service is awake");
        } else {
          console.log(
            "⚠️ File parser service responded with status:",
            response.status
          );
        }
      } catch (error) {
        console.log("❌ Failed to wake up file parser service:", error);
      }
    };

    wakeUpFileParserService();
  }, []);

  // This component renders nothing visible
  return null;
}
