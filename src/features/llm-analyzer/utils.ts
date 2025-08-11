import { GoogleGenAI } from "@google/genai";
import { gmailBotResponseSchema } from "@/features/llm-analyzer/schemas/gmailBotSchema";
import { atsBatchAnalysisSchema } from "@/features/llm-analyzer/schemas/atsSchema";
import { interviewQuestionsSchema } from "@/features/llm-analyzer/schemas/interviewQuestionsSchema";
import { createGmailBotResponsePrompt } from "@/features/llm-analyzer/prompts/gmailBotPrompt";
import { createAtsPrompt } from "@/features/llm-analyzer/prompts/atsPrompt";
import { createInterviewQuestionsPrompt } from "@/features/llm-analyzer/prompts/interviewQuestionsPrompt";
import {
  InterviewQuestionsData,
  GmailBotResponse,
} from "@/features/llm-analyzer/types";
import { EmailInfo } from "@/features/gmail/types";
import { CVMatch } from "@/shared/types";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

/**
 * Analyzes input content using the Gemini LLM and validates it against a given Zod schema.
 *
 * @param prompt - The input string to be sent to Gemini for analysis.
 * @param schema - A Zod schema used to validate and parse the response.
 * @returns A parsed JSON object conforming to the schema, or `null` if parsing or generation fails.
 */
async function analyzeWithGemini(prompt: string, schema: any): Promise<any> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const responseText = response.text?.trim();

    if (!responseText) {
      throw new Error("Gemini returned empty response text.");
    }

    return JSON.parse(responseText);
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "Unknown Gemini analysis error";
    console.error("Gemini Analysis Failed:", errMsg);
    return null;
  }
}

/**
 * Generates an AI-powered reply to an email using Gemini and a custom Gmail response prompt.
 *
 * @param email - The email object containing subject, sender, and body.
 * @returns A structured AI response object. Falls back to default error message if generation fails.
 */
export async function generateGamilBotResponse(
  email: EmailInfo,
  companyContext: string
): Promise<GmailBotResponse> {
  try {
    const prompt = createGmailBotResponsePrompt(
      email.subject,
      email.from,
      email.body,
      companyContext
    );

    const geminiResponse = await analyzeWithGemini(prompt, gmailBotResponseSchema);

    if (!geminiResponse) {
      throw new Error("Gemini failed to generate a valid email response.");
    }

    return {
      messageId: email.id,
      threadId: email.threadId,
      subject: email.subject,
      from: email.from,
      ...geminiResponse,
    };
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "Unknown AI response error";

    console.error("generateGamilAIResponse Error:", errMsg);

    return {
      messageId: email.id,
      threadId: email.threadId,
      subject: email.subject,
      from: email.from,
      shouldRespond: false,
      responseType: "requires_human",
      priority: "medium",
      responseBody: "⚠️ AI response failed!",
      responseReasoning: "Gemini generation failed or was invalid.",
      followUpRequired: true,
      error: errMsg,
    };
  }
}

/**
 * Analyzes multiple CVs against a given job description using Gemini and an ATS prompt.
 *
 * @param combinedCvText - Combined raw text of multiple CVs, separated by delimiters.
 * @param jobDescription - The job description text to compare CVs against.
 * @returns A list of matching CV analysis results, or `null` if generation fails.
 */
export async function analyzeCvBatch(
  combinedCvText: string,
  jobDescription: string
): Promise<CVMatch[] | null> {
  try {
    const atsPrompt = createAtsPrompt(jobDescription);
    const fullPrompt = `${atsPrompt}\n\n---CV CONTENT---\n\n${combinedCvText}`;

    const geminiResponse = await analyzeWithGemini(
      fullPrompt,
      atsBatchAnalysisSchema
    );

    if (!geminiResponse) {
      throw new Error("No ATS match results returned.");
    }

    return geminiResponse;
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "Unknown CV analysis error";

    console.error("analyzeCvBatch Error:", errMsg);
    return null;
  }
}

/**
 * Generates interview questions based on a job description and a single CV match analysis.
 *
 * @param jobDescription - The job description text.
 * @param cvAnalysis - A single analyzed CV matched against the job.
 * @returns A structured set of interview questions or `null` if generation fails.
 */
export async function generateInterviewQuestions(
  jobDescription: string,
  cvAnalysis: CVMatch
): Promise<InterviewQuestionsData | null> {
  try {
    const prompt = createInterviewQuestionsPrompt(jobDescription, cvAnalysis);

    const geminiResponse = await analyzeWithGemini(
      prompt,
      interviewQuestionsSchema
    );

    if (!geminiResponse) {
      throw new Error("Interview question generation failed.");
    }

    return geminiResponse;
  } catch (error) {
    const errMsg =
      error instanceof Error
        ? error.message
        : "Unknown error generating interview questions";

    console.error("generateInterviewQuestions Error:", errMsg);
    return null;
  }
}
