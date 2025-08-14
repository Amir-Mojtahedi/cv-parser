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
        await fetch(`${fileParserUrl}/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.log("❌ Failed to wake up file parser service:", error);
      }
    };

    wakeUpFileParserService();
  }, []);

  // This component renders nothing visible
  return null;
}
