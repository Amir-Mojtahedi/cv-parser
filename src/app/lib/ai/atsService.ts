"use server";

import { GoogleGenAI } from "@google/genai";
import { atsAnalysisSchema } from "@/app/lib/ai/atsSchema";
import { createAtsPrompt } from "@/app/lib/ai/atsPrompt";
import { CVMatch, ATSResponse } from "@/app/types/types";
import { PutBlobResult } from "@vercel/blob";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

/**
 * Analyzes a CV file against a job description using Google's Gemini AI model.
 * Converts the file to base64, sends it to the AI model with a structured prompt,
 * and returns the analysis results in JSON format.
 * @param {File} file - The CV file to analyze.
 * @param {string} jobDescription - The job description text to match against.
 * @returns {Promise<ATSResponse | null>} A promise that resolves to the analysis results or null if processing fails.
 */
async function analyzeCV(
  file: File,
  jobDescription: string
): Promise<ATSResponse | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const prompt = createAtsPrompt(jobDescription);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: prompt },
        {
          inlineData: {
            data: Buffer.from(buffer).toString("base64"),
            mimeType: file.type,
          },
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: atsAnalysisSchema,
      },
    });

    const responseText = response.text?.trim();

    if (responseText) {
      try {
        return JSON.parse(responseText) as ATSResponse;
      } catch (jsonError) {
        console.error(`Error parsing JSON for file ${file.name}:`, jsonError);
        console.error("Raw response text:", responseText);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return null;
  }
}

/**
 * Analyzes multiple CV files against a job description and returns the top matches.
 * 
 * This function fetches CV files from Vercel Blob storage URLs, analyzes each CV against
 * the provided job description using Google's Gemini AI model, and returns the top N
 * candidates sorted by their match scores. If any CV fails to process, it returns a
 * structured error object with zero scores and error reasoning.
 * 
 * @param {PutBlobResult[]} cvFilesBlob - An array of Vercel Blob storage objects containing CV file metadata and URLs.
 * @param {string} jobDescription - The job description text to match CVs against.
 * @param {number} topN - The number of top candidates to return (default: 5).
 * @returns {Promise<CVMatch[]>} A promise that resolves to an array of CV matches sorted by score in descending order.
 */
export async function findTopCVMatches(
  cvFilesBlob: PutBlobResult[],
  jobDescription: string,
  topN: number = 5
): Promise<CVMatch[]> {
  const ANALYSIS_ERROR = "Analysis Failed.";

  const analysisPromises = cvFilesBlob.map(
    async (cvFileBlob): Promise<CVMatch> => {
      const fileName = cvFileBlob.pathname;

      try {
        const response = await fetch(cvFileBlob.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const mimeType =
          response.headers.get("Content-Type") || "application/octet-stream";

        const file = new File([arrayBuffer], fileName, { type: mimeType });

        const analysisResult = await analyzeCV(file, jobDescription);

        if (analysisResult) {
          return {
            fileName: file.name,
            matchScore: analysisResult.grade,
            analysis: analysisResult.analysis,
          };
        } else {
          throw new Error("Analysis did not return a valid result.");
        }
      } catch (error) {
        console.error(
          `Failed to process CV from URL ${cvFileBlob.url}:`,
          error
        );
        // Return a structured error object if fetching or analysis fails
        return {
          fileName: fileName,
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
        };
      }
    }
  );

  const allMatches = await Promise.all(analysisPromises);

  // Sort and return the top N results as before
  return allMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, topN);
}
