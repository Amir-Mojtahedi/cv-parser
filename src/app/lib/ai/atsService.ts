"use server";

import { GoogleGenAI } from "@google/genai";
import { atsAnalysisSchema } from "./atsSchema"; // Import the schema
import { createAtsPrompt } from "./atsPrompt"; // Import the prompt function
import { CVMatch, ATSResponse } from "./types"; // Import types

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Helper function to process a single file
async function analyzeCV(
  file: File,
  jobDescription: string
): Promise<ATSResponse | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const prompt = createAtsPrompt(jobDescription);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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
    return null; // Return null on any processing error
  }
}

export async function findTopCVMatches(
  files: File[],
  jobDescription: string,
  topN: number = 5
): Promise<CVMatch[]> {
  const matches: CVMatch[] = [];
  const ANALYSIS_ERROR = "Analysis Failed.";

  for (const file of files) {
    const analysisResult = await analyzeCV(file, jobDescription);

    if (analysisResult) {
      matches.push({
        fileName: file.name,
        matchScore: analysisResult.grade,
        analysis: analysisResult.analysis,
      });
    } else {
      matches.push({
        fileName: file.name,
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
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, topN);
}
