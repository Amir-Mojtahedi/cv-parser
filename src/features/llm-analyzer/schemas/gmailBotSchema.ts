import { Type } from "@google/genai";

export const gmailBotResponseSchema = {
  type: Type.OBJECT,
  properties: {
    shouldRespond: {
      type: Type.BOOLEAN,
      description: "Whether the AI should automatically respond to this email. Set to false for spam, promotional emails, or emails that require human intervention.",
    },
    responseType: {
      type: Type.STRING,
      description: "The type of response needed: 'general_inquiry', 'job_application', 'support_request', 'spam', 'requires_human', or 'acknowledgment'",
      enum: ["general_inquiry", "job_application", "support_request", "spam", "requires_human", "acknowledgment"]
    },
    priority: {
      type: Type.STRING,
      description: "Priority level of the email: 'low', 'medium', 'high', or 'urgent'",
      enum: ["low", "medium", "high", "urgent"]
    },
    responseBody: {
      type: Type.STRING,
      description: "The complete email response text that should be sent. Should be professional, helpful, and ready to send as-is.",
    },
    responseReasoning: {
      type: Type.STRING,
      description: "Brief explanation of why this response was chosen and whether human review is recommended.",
    },
    followUpRequired: {
      type: Type.BOOLEAN,
      description: "Whether this email requires follow-up action from a human team member.",
    }
  },
  required: ["shouldRespond", "responseType", "priority", "responseBody", "responseReasoning", "followUpRequired"],
  propertyOrdering: ["shouldRespond", "responseType", "priority", "responseBody", "responseReasoning", "followUpRequired"]
};
