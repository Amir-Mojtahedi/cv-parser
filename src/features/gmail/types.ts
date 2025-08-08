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
