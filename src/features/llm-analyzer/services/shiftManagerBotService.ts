"use server";

import { EmailReply } from "@/features/llm-analyzer/types";
import { Shift, Worker } from "@/features/gmail/types";
import { analyzeShiftAcceptance } from "../utils";
import { closeShift } from "@/features/database/supabase/shiftSupabaseService";

/**
 * Analyzes an employee's email response to determine if they want to accept a shift.
 *
 * @param shift - The shift details being offered
 * @param emailBody - The content of the employee's email response
 * @param subject - The subject of the email
 * @param from - The sender's email address
 * @returns A ShiftManagerBotResponse indicating whether the employee wants the shift
 */
export async function assignShiftToWorker(
  emailReplies: EmailReply[],
  shift: Shift
): Promise<Shift | void> {
  for (const reply of emailReplies) {
    try {
      const analysis = await analyzeShiftAcceptance(
        shift,
        reply.body,
        reply.subject,
        reply.from
      );

      if (analysis.wantsShift) {
        const assignedWorker: Worker = {
          name: reply.fromName,
          email: reply.fromEmail,
        };

        const updatedShift: Shift = {
          ...shift,
          worker: assignedWorker,
          status: "assigned",
        };

        if (shift.gmailMessageId) {
          await closeShift(shift.gmailMessageId);
        }
        return updatedShift;
      }
    } catch (analysisError) {
      console.error(
        `Error analyzing reply from ${reply.fromName}:`,
        analysisError
      );
      continue;
    }
  }
}
