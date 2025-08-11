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
  bodyHtml: string,
  originalEmail?: {
    date: string;
    from: string;
    body: string;
  }
): Promise<boolean> {
  try {
    const auth = await getGoogleAuthClient();
    const gmail = google.gmail({ version: "v1", auth });

    // Create the full email body with threading
    let fullBodyHtml = bodyHtml;

    if (originalEmail) {
      // Clean up the original body (remove any existing HTML quotes to avoid nesting)
      const cleanOriginalBody = originalEmail.body
        .replace(/<div class="gmail_quote">[\s\S]*?<\/div>/g, "")
        .replace(/<blockquote class="gmail_quote"[\s\S]*?<\/blockquote>/g, "")
        .trim();

      // Add the quoted original message below the new response
      fullBodyHtml += `
        <br><br>
        <div class="gmail_quote">
          <div dir="ltr" class="gmail_attr">
            On ${originalEmail.date}, &lt;${originalEmail.from}&gt; wrote:<br>
          </div>
          <blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex">
            ${cleanOriginalBody}
          </blockquote>
        </div>
      `;
    }

    // Ensure subject has "Re:" prefix if it's a reply and doesn't already have it
    const replySubject = subject.toLowerCase().startsWith("re:")
      ? subject
      : `Re: ${subject}`;

    // Get the thread messages to find the original Message-ID for proper threading
    let messageId = "";
    try {
      const thread = await gmail.users.threads.get({
        userId: "me",
        id: threadId,
        format: "metadata",
        metadataHeaders: ["Message-ID"],
      });

      // Get the first message in the thread (the original message)
      const firstMessage = thread.data.messages?.[0];
      if (firstMessage?.payload?.headers) {
        const messageIdHeader = firstMessage.payload.headers.find(
          (header) => header.name?.toLowerCase() === "message-id"
        );

        if (messageIdHeader?.value) {
          messageId = messageIdHeader.value;
        }
      }
    } catch (metadataError) {
      console.warn(
        "Could not retrieve original message ID for threading:",
        metadataError
      );
      // Continue without proper Message-ID threading
    }

    // Build email headers
    const headers = [
      `To: ${to}`,
      `Subject: ${replySubject}`,
      "Content-Type: text/html; charset=UTF-8",
      "MIME-Version: 1.0",
    ];

    // Add threading headers if we have a message ID
    if (messageId) {
      headers.push(`In-Reply-To: ${messageId}`);
      headers.push(`References: ${messageId}`);
    }

    const rawMessage = [...headers, "", fullBodyHtml].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId, // This ensures it stays in the same thread
      },
    });

    console.log(
      `✅ Email reply sent successfully to ${to} in thread ${threadId}`
    );
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
    console.log(`✅ Marked email ${messageId} as read`);
  } catch (error) {
    console.error("Error marking email as read:", error);
  }
}
