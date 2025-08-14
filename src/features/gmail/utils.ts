"use server";

import { google } from "googleapis";
import { getCurrentUser } from "@/features/authentication/authService";
import {
  getAccountByUserId,
  supabase,
} from "@/features/database/supabase/userSupabaseService";
import { EmailInfo, Shift } from "@/features/gmail/types";
import { isShiftOpen } from "@/features/database/supabase/shiftSupabaseService";
import { assignShiftToWorker } from "../llm-analyzer/services/shiftManagerBotService";

/**
 * Refreshes the Google OAuth tokens using the account's refresh token
 * and updates the corresponding row in the Supabase `accounts` table.
 *
 * @param account - The account object from Supabase containing at least `refresh_token` and `id`.
 * @returns The newly refreshed OAuth2 credentials.
 * @throws If token refresh fails or Supabase update fails.
 */
async function refreshGoogleTokens(account: any) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: account.refresh_token,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  await supabase
    .from("accounts")
    .update({
      access_token: credentials.access_token,
      expires_at: Math.floor((credentials.expiry_date || Date.now()) / 1000),
      refresh_token: credentials.refresh_token ?? account.refresh_token,
    })
    .eq("id", account.id);

  return credentials;
}

/**
 * Retrieves an authenticated Google OAuth2 client for the current user.
 * If the access token is expired, it will be refreshed automatically and persisted in Supabase.
 *
 * @returns An authorized OAuth2 client ready to make Gmail API calls.
 * @throws If the user is not authenticated or does not have a linked Google account.
 */
async function getGoogleAuthClient() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const account = await getAccountByUserId(user.id);
  if (!account) {
    throw new Error("Google account not linked");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  const isExpired = Date.now() > account.expires_at! * 1000;

  if (isExpired) {
    const credentials = await refreshGoogleTokens(account);
    oauth2Client.setCredentials(credentials);
  } else {
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });
  }

  return oauth2Client;
}

/**
 * Recursively scans a MIME payload for the best readable body (preferring HTML > plain text).
 *
 * @param payload - A Gmail `MessagePart` payload object.
 * @returns The decoded string contents of the message body.
 */
function extractBody(payload: any): string {
  const { mimeType, body, parts } = payload;
  const decode = (b64: string) =>
    Buffer.from(b64, "base64url").toString("utf-8");

  if (mimeType === "text/html" || mimeType === "text/plain") {
    return decode(body.data);
  }

  for (const part of parts || []) {
    const result = extractBody(part);
    if (result) return result;
  }

  return "";
}

/**
 * Extracts the value of a specific header from a list of Gmail headers.
 *
 * @param headers - Array of Gmail message headers.
 * @param name - The case-insensitive name of the header to retrieve.
 * @returns The header value if found, otherwise an empty string.
 */
function getEmailHeaders(headers: any[], name: string): string {
  const header = headers.find(
    (h) => h?.name?.toLowerCase() === name.toLowerCase()
  );
  return header?.value || "";
}

/**
 * Fetches detailed email information by its ID.
 *
 * @param gmail - Authenticated Gmail API client.
 * @param messageId - ID of the message to fetch.
 * @returns An `EmailInfo` object with parsed data.
 * @throws Error if the message retrieval or parsing fails.
 */
async function fetchEmailById(
  gmail: ReturnType<typeof google.gmail>,
  messageId: string
): Promise<EmailInfo> {
  try {
    const { data: message } = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    if (!message.payload) {
      throw new Error(`Missing payload for message ID: ${messageId}`);
    }

    const headers = message.payload.headers || [];
    const bodyText = extractBody(message.payload);

    return {
      id: message.id!,
      threadId: message.threadId!,
      subject: getEmailHeaders(headers, "Subject") || "",
      from: getEmailHeaders(headers, "From") || "",
      date: getEmailHeaders(headers, "Date") || "",
      body: bodyText,
      contentType: getEmailHeaders(headers, "Content-Type") || "",
      labelIds: message.labelIds!,
    };
  } catch (err) {
    throw new Error(
      `Failed to fetch or parse email with ID "${messageId}": ${
        (err as Error).message
      }`
    );
  }
}

interface EmailReply {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  date: Date;
  internalDate: string;
}

async function manageShift(shift: Shift): Promise<Shift> {
  const auth = await getGoogleAuthClient();
  const gmail = google.gmail({ version: "v1", auth });

  try {
    if (shift.gmailMessageId) {
      const isOpen = await isShiftOpen(shift.gmailMessageId);
      if (!isOpen) {
        return shift;
      }
    }

    const threadResponse = await gmail.users.threads.get({
      userId: "me",
      id: shift.gmailThreadId!,
    });

    const messages = threadResponse.data.messages || [];
    const replyMessages = messages.slice(1);

    if (replyMessages.length === 0) {
      return shift;
    }

    const detailedReplies = await Promise.all(
      replyMessages.map((message) => fetchEmailById(gmail, message.id!))
    );

    const emailReplies: EmailReply[] = detailedReplies.map(
      (replyInfo, index) => {
        const fromHeader = replyInfo.from;
        const fromMatch =
          fromHeader.match(/^(.+?)\s*<(.+?)>$/) || fromHeader.match(/^(.+)$/);
        const fromName =
          fromMatch?.[1]?.trim().replace(/^["']|["']$/g, "") || "";
        const fromEmail = fromMatch?.[2]?.trim() || fromHeader.trim();

        const internalDate = replyMessages[index].internalDate!;

        return {
          id: replyInfo.id,
          threadId: replyInfo.threadId,
          from: fromHeader,
          fromName,
          fromEmail,
          subject: replyInfo.subject,
          body: replyInfo.body.trim(),
          date: new Date(parseInt(internalDate)),
          internalDate,
        };
      }
    );

    emailReplies.sort((a, b) => a.date.getTime() - b.date.getTime());

    shift = (await assignShiftToWorker(emailReplies, shift)) ?? shift;

    return shift;
  } catch (error) {
    console.error("Error assigning shift to worker:", error);
    throw new Error(`Failed to assign shift: ${(error as Error).message}`);
  }
}

export { getGoogleAuthClient, fetchEmailById, manageShift };
