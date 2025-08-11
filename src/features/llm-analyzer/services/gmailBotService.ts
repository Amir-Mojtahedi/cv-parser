"use server";

import { cacheGmailBotResponses } from "@/features/database/redis";
import { GmailBotResponse } from "@/features/llm-analyzer/types";
import { generateGamilBotResponse } from "@/features/llm-analyzer/utils";
import {
  checkForNewEmails,
  markEmailAsRead,
  sendEmailReply,
} from "@/features/gmail/gmailService";

/**
 * Processes new unread emails and generates AI-powered responses for each one.
 *
 * This function:
 * - Fetches up to 10 unread emails from the inbox.
 * - Uses Gemini AI to generate a reply for each email.
 * - Sends the reply if `shouldRespond` is true and `responseBody` exists.
 * - Marks the email as read if the reply is successfully sent.
 * - Caches the AI response in Redis for future use.
 *
 * @returns {Promise<GmailBotResponse[]>} - A list of GmailBotResponse objects, each representing an attempted AI interaction.
 *
 * @throws {Error} - If the main processing fails, the error is logged and rethrown for upper-level handling.
 */

export async function processNewEmails(
  companyContext: string
): Promise<GmailBotResponse[]> {
  try {
    const newEmails = await checkForNewEmails();

    if (!newEmails.length) {
      console.info("📭 No new emails to process.");
      return [];
    }

    const gmailBotResponses = await Promise.all(
      newEmails.map(async (email): Promise<GmailBotResponse> => {
        try {
          const gmailBotResponse = await generateGamilBotResponse(
            email,
            companyContext
          );

          if (gmailBotResponse.shouldRespond && gmailBotResponse.responseBody) {
            const sent = await sendEmailReply(
              email.threadId,
              email.from,
              email.subject,
              gmailBotResponse.responseBody,
              {
                date: email.date || new Date().toLocaleString(), // Use email's date
                from: email.from,
                body: email.body || "Original message content", // Use full body or snippet
              }
            );

            if (sent) {
              gmailBotResponse.sentAt = new Date();
              await markEmailAsRead(email.id);
            } else {
              gmailBotResponse.error = "Failed to send reply";
              gmailBotResponse.followUpRequired = true;
            }
          }
          return gmailBotResponse;
        } catch (emailError) {
          const errorMessage =
            emailError instanceof Error
              ? emailError.message
              : "Unknown email processing error";

          console.error(
            `📛 Error processing email "${email.subject}" from "${email.from}":`,
            errorMessage
          );

          return {
            messageId: email.id,
            threadId: email.threadId,
            subject: email.subject,
            from: email.from,
            shouldRespond: false,
            responseType: "requires_human",
            priority: "medium",
            responseBody:
              "⚠️ Error occurred during processing. Human follow-up required.",
            responseReasoning: errorMessage,
            followUpRequired: true,
            error: errorMessage,
          };
        }
      })
    );

    await cacheGmailBotResponses(gmailBotResponses);
    return gmailBotResponses;
  } catch (fatalError) {
    const errMsg =
      fatalError instanceof Error
        ? fatalError.message
        : "Unknown fatal error in processNewEmails";

    console.error("💥 Fatal error in processNewEmails:", errMsg);
    throw new Error(`processNewEmails failed: ${errMsg}`);
  }
}
