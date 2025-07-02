"use server";

import { GoogleGenAI } from "@google/genai";
import { atsAnalysisSchema } from "./atsSchema";
import { createAtsPrompt } from "./atsPrompt";
import { CVMatch, ATSResponse } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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

export async function findTopCVMatches(
  files: File[],
  jobDescription: string,
  topN: number = 5
): Promise<CVMatch[]> {
  const ANALYSIS_ERROR = "Analysis Failed.";

  const analysisPromises = files.map(async (file): Promise<CVMatch> => {
    try {
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
      console.error(`Failed to analyze CV: ${file.name}`, error);
      return {
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
      };
    }
  });

  const allMatches = await Promise.all(analysisPromises);

  return allMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, topN);
}
