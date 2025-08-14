"use server";

import { EmailReply } from "@/features/llm-analyzer/types";
import { Shift, Worker } from "@/features/gmail/types";
import { analyzeShiftAcceptance } from "../utils";
import { closeShift } from "@/features/database/supabase/shiftSupabaseService";
import { sendEmailReply } from "@/features/gmail/gmailService";

/**
 * Sends a confirmation email to the worker who has been assigned the shift.
 *
 * @param shift - The shift that has been assigned.
 * @param worker - The worker who was assigned the shift.
 * @param threadId - The Gmail thread ID for the conversation.
 */
async function sendShiftConfirmationEmail(
  shift: Shift,
  worker: Worker,
  threadId: string
) {
  const subject = `Shift Confirmed: ${shift.department} on ${shift.date}`;
  const bodyHtml = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <p>Hi ${worker.name},</p>
      <p>Great news! You have been confirmed for the following shift:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li><strong>Date:</strong> ${shift.date}</li>
        <li><strong>Time:</strong> ${shift.startTime} - ${shift.endTime}</li>
        <li><strong>Department:</strong> ${shift.department}</li>
      </ul>
      <p>Thank you for picking it up. We've added it to your schedule.</p>
      <p>Best regards,<br/>The Management Team</p>
    </div>
  `;

  await sendEmailReply(threadId, worker.email, subject, bodyHtml);
}

/**
 * Sends a rejection email to workers who replied but were not selected.
 *
 * @param shift - The shift that was available.
 * @param worker - The worker who was not selected.
 * @param threadId - The Gmail thread ID for the conversation.
 */
async function sendShiftRejectionEmail(
  shift: Shift,
  worker: Worker,
  threadId: string
) {
  const subject = `Update on the shift for ${shift.date}`;
  const bodyHtml = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <p>Hi ${worker.name},</p>
      <p>
        Thank you for your interest in the shift on <strong>${shift.date}</strong>
        from <strong>${shift.startTime} to ${shift.endTime}</strong>.
      </p>
      <p>
        The position has now been filled, but we appreciate you offering to take
        it. We'll keep you in mind for future opportunities!
      </p>
      <p>Best regards,<br/>The Management Team</p>
    </div>
  `;

  await sendEmailReply(threadId, worker.email, subject, bodyHtml);
}

/**
 * Analyzes email responses, assigns a shift to the first qualified person,
 * and notifies all applicants of the decision.
 *
 * @param emailReplies - A list of all email replies for the shift.
 * @param shift - The shift details.
 * @returns The updated Shift object if assigned, otherwise void.
 */
export async function assignShiftToWorker(
  emailReplies: EmailReply[],
  shift: Shift
): Promise<Shift | void> {
  let assignedWorker: Worker | null = null;
  let updatedShift: Shift | null = null;

  for (const reply of emailReplies) {
    // If a worker has already been found in a previous iteration, stop.
    if (assignedWorker) break;

    try {
      const analysis = await analyzeShiftAcceptance(
        shift,
        reply.body,
        reply.subject,
        reply.from
      );

      if (analysis.wantsShift) {
        assignedWorker = {
          name: reply.fromName,
          email: reply.fromEmail,
        };

        updatedShift = {
          ...shift,
          worker: assignedWorker,
          status: "assigned",
        };

        if (shift.gmailMessageId) {
          await closeShift(shift.gmailMessageId);
        }
      }
    } catch (analysisError) {
      console.error(
        `Error analyzing reply from ${reply.fromName}:`,
        analysisError
      );
    }
  }

  // If a worker was assigned, send out confirmation and rejection emails
  if (assignedWorker && updatedShift) {
    console.log(
      `✅ Shift assigned to ${assignedWorker.name}. Sending notifications...`
    );

    const threadId = emailReplies[0].threadId; // All replies share the same thread ID

    // 1. Find all applicants who were not chosen
    const rejectedWorkers: Worker[] = emailReplies
      .filter((reply) => reply.fromEmail !== assignedWorker!.email)
      .map((reply) => ({
        name: reply.fromName,
        email: reply.fromEmail,
      }));

    // 2. Send all notification emails concurrently
    try {
      await Promise.all([
        // Send confirmation to the winner
        sendShiftConfirmationEmail(updatedShift, assignedWorker, threadId),
        // Send rejections to the others
        ...rejectedWorkers.map((worker) =>
          sendShiftRejectionEmail(updatedShift!, worker, threadId)
        ),
      ]);
      console.log(
        "✅ All confirmation and rejection emails sent successfully."
      );
    } catch (emailError) {
      console.error("🚨 Failed to send notification emails:", emailError);
      // The shift is still assigned, but we should log the email failure
    }

    return updatedShift;
  }
}
