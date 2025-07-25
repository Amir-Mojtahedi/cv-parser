import { CVAnalysis } from "@/features/llm-analyzer/types";

export interface CVMatch {
  fileName: string;
  matchScore: number;
  analysis: CVAnalysis;
}

export interface ResultWithId extends CVMatch {
  cacheId: string;
}

export type SerializableFile = {
  name: string;
  type: string;
  size: number;
  content: string; // base64 encoded string
};


