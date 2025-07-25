'use server';

import { LangflowClient } from "@datastax/langflow-client";
import { PutBlobResult } from "@vercel/blob";
import {
  combineCVTextsForPrompt,
  convertFileToText,
} from "@/shared/utils";
import { CVMatch } from "@/shared/types";

const ANALYSIS_ERROR = "Analysis Failed.";

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const flowId = getEnvOrThrow("LANGFLOW_FLOW_ID");
const langflowClient = new LangflowClient({
  baseUrl: "http://localhost:7860",
  apiKey: getEnvOrThrow("LANGFLOW_API_KEY"),
});

// Utility: Abortable fetch
async function fetchWithTimeout(
  url: string,
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// Utility: Error fallback result
function generateFallbackResult(fileName: string): CVMatch {
  return {
    fileName,
    matchScore: 0,
    analysis: {
      "Hard Skills": { score: 0, reasoning: ANALYSIS_ERROR },
      Education: { score: 0, reasoning: ANALYSIS_ERROR },
      Experience: { score: 0, reasoning: ANALYSIS_ERROR },
      "Soft Skills": { score: 0, reasoning: ANALYSIS_ERROR },
      "Diversity in experience": { score: 0, reasoning: ANALYSIS_ERROR },
      Approximation: { score: 0, reasoning: ANALYSIS_ERROR },
    },
  };
}

// Utility: Safe JSON parsing
function tryParseJSON<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

function stripMarkdownCodeFence(output: string): string {
  return output.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}


export async function analyzeCVsWithLangflow(
  cvFilesBlob: PutBlobResult[],
  jobDescription: string,
  topN = 5
): Promise<CVMatch[]> {
  const cvTextResults = await Promise.allSettled(
    cvFilesBlob.map(async (blob) => {
      try {
        const res = await fetchWithTimeout(blob.url);
        if (!res.ok) throw new Error(`Failed to fetch: ${blob.pathname}`);
        const text = await convertFileToText(blob.url);
        return { fileName: blob.pathname, cvText: text };
      } catch (err) {
        console.warn(`❌ Skipping CV ${blob.pathname}:`, err);
        return null;
      }
    })
  );

  const validCVs = cvTextResults
    .filter(
      (
        res
      ): res is PromiseFulfilledResult<{ fileName: string; cvText: string }> =>
        res.status === "fulfilled" && res.value !== null
    )
    .map((res) => res.value);

  const combinedCVMap = combineCVTextsForPrompt(validCVs, 3);

  const analysisResults = await Promise.all(
    Object.entries(combinedCVMap).map(async ([fileNames, combinedText]) => {
      try {
        const prompt = `Job description:\n${jobDescription}\n\nCVs:\n ${combinedText} `;
        const flow = langflowClient.flow(flowId);
        const result = await flow.run(prompt)
        const output = result.chatOutputText()?.trim();
        const parsed = output
          ? tryParseJSON<{ cvAnalyses: CVMatch[] }>(stripMarkdownCodeFence(output))
          : null;

        if (parsed?.cvAnalyses) return parsed.cvAnalyses;

        console.error("⚠️ Invalid agent response:", output);
        throw new Error("Empty or invalid response");
      } catch (err) {
        console.error(`🧨 Batch analysis failed for [${fileNames}]:`, err);
        return fileNames.split(",").map(generateFallbackResult);
      }
    })
  );

  return analysisResults
    .flat()
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN);
}
