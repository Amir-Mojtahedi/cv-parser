export interface EmailInfo {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  contentType: string;
  labelIds: string[];
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  recipients: string[];
  subject: string;
  timestamp: string;
  error?: string;
}

export interface Worker {
  name: string;
  email: string;
}

export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  worker: Worker | null;
  status: "assigned" | "open" | "broadcasting" | "pending_response";
  department: string;
  gmailThreadId?: string;
  gmailMessageId?: string;
}


