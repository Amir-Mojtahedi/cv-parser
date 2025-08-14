// features/shift-manager-bot/shiftManagerBotPrompt.ts

import { Shift } from "@/features/gmail/types";

/**
 * Creates the prompt for the Shift Manager AI Bot to analyze an employee's email.
 *
 * @param shift - The details of the open shift being discussed.
 * @param emailBody - The content of the employee's email.
 * @param subject - The subject of the employee's email.
 * @param from - The sender of the email.
 * @returns A prompt string for the AI model to determine shift acceptance intent.
 */
export const createShiftManagerBotPrompt = (
  shift: Shift,
  emailBody: string,
  subject: string,
  from: string
) => `
You are an AI assistant that analyzes employee emails responding to shift broadcasts.

## Your ONLY Task:
Determine if the employee is clearly accepting the shift or not.

## Context:
-   **Open Shift**:
    -   Date: ${shift.date}
    -   Time: ${shift.startTime} - ${shift.endTime}
    -   Department: ${shift.department}
-   **Employee Email**:
    -   From: ${from}
    -   Subject: ${subject}
    -   Content: ${emailBody}

## Decision Rules:
1. **ACCEPTS SHIFT**: Clear "yes" responses like:
   - "Yes, I'll take it"
   - "I'm available"  
   - "Count me in"
   - "I can work that shift"
   - Any clear positive acceptance

2. **NO ACTION**: Everything else including:
   - Questions ("What department?")
   - Irrelevant content ("banana", spam)
   - Unclear responses
   - "Maybe" or conditional responses

Analyze the email and determine if it's a clear shift acceptance.
`;
