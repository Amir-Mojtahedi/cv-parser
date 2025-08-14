// features/shift-manager-bot/shiftManagerBotSchema.ts

import { Type } from "@google/genai";

export const shiftManagerBotSchema = {
  type: Type.OBJECT,
  properties: {
    wantsShift: {
      type: Type.BOOLEAN,
      description:
        "Set to true ONLY if the email is a clear acceptance of the shift. Set to false for everything else (questions, irrelevant content, unclear responses).",
    },
    reasoning: {
      type: Type.STRING,
      description:
        "Brief explanation for the decision (e.g., 'User explicitly accepted the shift' or 'Email was a question, not an acceptance')",
    },
  },
  required: ["wantsShift", "reasoning"],
};
