import { google } from "googleapis";
import { getGoogleAuthClient, fetchEmailById } from "@/features/gmail/utils";
import { EmailInfo } from "@/features/gmail/types";

/**
 * Fetches the latest 10 emails from the inbox received in the last 7 days,
 * excluding promotions and spam.
 *
 * @returns A promise that resolves to a list of `EmailInfo` objects.
 * @throws Error if the Gmail list API or individual message fetch fails.
 */
export async function getEmails(): Promise<EmailInfo[]> {
  try {
    const auth = await getGoogleAuthClient();
    const gmail = google.gmail({ version: "v1", auth });

    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: "in:inbox newer_than:7d -category:promotions",
      includeSpamTrash: false,
    });

    const messages = list.data.messages || [];

    return await Promise.all(
      messages.map(({ id }) => fetchEmailById(gmail, id!))
    );
  } catch (err) {
    console.error("❌ Error in getEmails():", err);
    throw new Error(`getEmails failed: ${(err as Error).message}`);
  }
}

/**
 * Checks the inbox for up to 10 new unread emails that are not categorized as
 * promotions or social.
 *
 * @returns A promise that resolves to a list of unread `EmailInfo` objects.
 * @throws Error if listing or fetching emails fails.
 */
export async function checkForNewEmails(): Promise<EmailInfo[]> {
  try {
    const auth = await getGoogleAuthClient();
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread in:inbox -category:promotions -category:social",
      maxResults: 10,
    });

    const messages = response.data.messages || [];

    return await Promise.all(
      messages.map(({ id }) => fetchEmailById(gmail, id!))
    );
  } catch (err) {
    console.error("🚨 Error in checkForNewEmails():", err);
    throw new Error(`checkForNewEmails failed: ${(err as Error).message}`);
  }
}

export async function sendEmailReply(
  threadId: string,
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    const auth = await getGoogleAuthClient();
    const gmail = google.gmail({ version: "v1", auth });

    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=UTF-8",
      "",
      body,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId,
      },
    });

    return true;
  } catch (err) {
    console.error("❌ Error in sendEmailReply():", err);
    throw new Error(`sendEmailReply failed: ${(err as Error).message}`);
  }
}

/**
 * Marks an email as read
 */
export async function markEmailAsRead(messageId: string): Promise<void> {
  try {
    const auth = await getGoogleAuthClient();
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });
  } catch (error) {
    console.error("Error marking email as read:", error);
  }
}
