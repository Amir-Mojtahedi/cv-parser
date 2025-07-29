import { GoogleGenAI } from "@google/genai";
import { atsBatchAnalysisSchema } from "@/features/llm-analyzer/schemas/atsSchema";
import { createAtsPrompt } from "@/features/llm-analyzer/prompts/atsPrompt";
import { interviewQuestionsSchema } from "@/features/llm-analyzer/schemas/interviewQuestionsSchema";
import { createInterviewQuestionsPrompt } from "@/features/llm-analyzer/prompts/interviewQuestionsPrompt";
import { InterviewQuestionsData } from "@/features/llm-analyzer/types";
import { CVMatch } from "@/shared/types";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

/**
 * Analyzes a BATCH of CV texts against a job description.
 * @param {string} combinedCvText - A single string containing multiple CVs separated by markers.
 * @param {string} jobDescription - The job description text to match against.
 * @returns {Promise<CVMatch[] | null>} A promise that resolves to an array of analysis results.
 */
async function analyzeCvBatch(
  combinedCvText: string,
  jobDescription: string
): Promise<CVMatch[] | null> {
  try {
    const atsPrompt = createAtsPrompt(jobDescription);
    const fullPrompt = `${atsPrompt}\n\n---CV CONTENT---\n\n${combinedCvText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: fullPrompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: atsBatchAnalysisSchema,
      },
    });

    const responseText = response.text?.trim();
    if (responseText) {
      const parsedResponse = JSON.parse(responseText);
      return parsedResponse.cvAnalyses || [];
    }
    return null;
  } catch (error) {
    console.error(`Error analyzing CV text batch:`, error);
    return null;
  }
}

/**
 * Generates interview questions based on job description and CV analysis.
 * @param {string} jobDescription - The job description text.
 * @param {CVMatch} cvAnalysis - The CV analysis results.
 * @returns {Promise<InterviewQuestionsData | null>} A promise that resolves to interview questions or null if failed.
 */
async function generateInterviewQuestions(
  jobDescription: string,
  cvAnalysis: CVMatch,
): Promise<InterviewQuestionsData | null> {
  try {
    const prompt = createInterviewQuestionsPrompt(jobDescription, cvAnalysis);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: interviewQuestionsSchema,
      },
    });

    const responseText = response.text?.trim();
    if (responseText) {
      const parsedResponse = JSON.parse(responseText) as InterviewQuestionsData;
      return parsedResponse;
    }
    return null;
  } catch (error) {
    console.error(`Error generating interview questions:`, error);
    return null;
  }
}

export { analyzeCvBatch, generateInterviewQuestions };
