"use server";

import { GoogleGenAI } from "@google/genai";
import { atsBatchAnalysisSchema } from "@/features/llm-analyzer/atsSchema";
import { createAtsPrompt } from "@/features/llm-analyzer/atsPrompt";
import { CVMatch } from "@/shared/types";
import { PutBlobResult } from "@vercel/blob";
import { combineCVTextsForPrompt, convertFileToText } from "@/shared/utils";

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
 * Finds and returns the top N CV matches for a given job description.
 *
 * This function processes an array of uploaded CV file blobs, extracts their text content
 * (supporting PDF and DOCX formats), batches them for efficient AI analysis, and uses a
 * generative AI model to score and analyze each CV against the provided job description.
 * The results are sorted by match score in descending order, and only the top N matches are returned.
 *
 * If a file cannot be processed or analyzed, it will be included in the results with a score of 0
 * and an error message in the analysis fields.
 *
 * @param {PutBlobResult[]} cvFilesBlob - An array of uploaded CV file blobs (from Vercel Blob storage).
 * @param {string} jobDescription - The job description text to match CVs against.
 * @param {number} [topN=5] - The number of top matches to return (default is 5).
 * @returns {Promise<CVMatch[]>} A promise that resolves to an array of CVMatch objects, sorted by match score.
 */
export async function findTopCVMatches(
  cvFilesBlob: PutBlobResult[],
  jobDescription: string,
  topN: number = 5
): Promise<CVMatch[]> {
  const ANALYSIS_ERROR = "Analysis Failed.";

  const cvTextPromises = cvFilesBlob.map(async (blob) => {
    const response = await fetch(blob.url);
    if (!response.ok) throw new Error(`Failed to fetch ${blob.pathname}`);

    const cvText = await convertFileToText(blob.url);

    return { fileName: blob.pathname, cvText };
  });

  const allCvTexts = await Promise.all(cvTextPromises);
  const validCvTexts = allCvTexts.filter((cv) => cv.cvText);

  const combinedCVMap = combineCVTextsForPrompt(validCvTexts, 3);

  const batchAnalysisPromises = Object.entries(combinedCVMap).map(
    async ([fileNamesKey, combinedCVText]) => {
      try {
        const analysisResults = await analyzeCvBatch(
          combinedCVText,
          jobDescription
        );
        if (analysisResults) {
          return analysisResults;
        }
        throw new Error("Batch analysis returned null.");
      } catch (error) {
        console.error(`Failed to process CV batch: ${fileNamesKey}`, error);

        const failedFiles = fileNamesKey.split(",");

        return failedFiles.map((fileName) => ({
          fileName,
          matchScore: 0,
          analysis: {
            "Hard Skills": { score: 0, reasoning: ANALYSIS_ERROR },
            Education: { score: 0, reasoning: ANALYSIS_ERROR },
            Experience: { score: 0, reasoning: ANALYSIS_ERROR },
            "Soft Skills": { score: 0, reasoning: ANALYSIS_ERROR },
            "Diversity in experience": {
              score: 0,
              reasoning: ANALYSIS_ERROR,
            },
            Approximation: { score: 0, reasoning: ANALYSIS_ERROR },
          },
        }));
      }
    }
  );

  const allMatchesNested = await Promise.all(batchAnalysisPromises);

  const allMatches: CVMatch[] = allMatchesNested.flat();

  return allMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, topN);
}
