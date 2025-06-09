"use server";

import { GoogleGenAI } from "@google/genai";
import { atsAnalysisSchema } from "./atsSchema"; // Import the schema
import { createAtsPrompt } from "./atsPrompt";     // Import the prompt function
import { CVMatch, ATSResponse  } from "./types"; // Import types

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Helper function to process a single file
async function analyzeCV(file: File, jobDescription: string): Promise<ATSResponse | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const prompt = createAtsPrompt(jobDescription); // Get the prompt dynamically

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { text: prompt },
        { inlineData: { data: Buffer.from(buffer).toString('base64'), mimeType: file.type } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: atsAnalysisSchema, // Use the imported schema
      },
    });

    const responseText = response.text?.trim();

    if (responseText) {
      try {
        // Since schema is used, direct parsing should be reliable
        return JSON.parse(responseText) as ATSResponse;
      } catch (jsonError) {
        console.error(`Error parsing JSON for file ${file.name}:`, jsonError);
        console.error("Raw response text:", responseText);
        return null; // Return null on parsing error
      }
    }
    return null;
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return null; // Return null on any processing error
  }
}

export async function main(files: File[], jobDescription: string, topN: number = 5): Promise<CVMatch[]> {
  const matches: CVMatch[] = [];

  for (const file of files) {
    const analysisResult = await analyzeCV(file, jobDescription);
    const fileUrl = URL.createObjectURL(file);

    if (analysisResult) {
      matches.push({
        fileName: file.name,
        matchScore: analysisResult.grade,
        fileUrl,
        analysis: analysisResult.analysis,
      });
    } else {
      // Handle cases where analysis failed for a file
      matches.push({
        fileName: file.name,
        matchScore: 0,
        fileUrl,
        analysis: { // Provide a default empty analysis for errors
          "Hard Skills": { score: 0, reasoning: "Analysis failed." },
          Education: { score: 0, reasoning: "Analysis failed"},
          Experience: { score: 0, reasoning: "Analysis failed." },
          "Soft Skills": { score: 0, reasoning: "Analysis failed." },
          "Diversity in experience": { score: 0, reasoning: "Analysis failed." },
          Approximation: { score: 0, reasoning: "Analysis failed." },
        },
      });
    }
  }

  // Sort by match score and return top N results
  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN);
}