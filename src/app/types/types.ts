import { type PutBlobResult } from "@vercel/blob";

export interface AnalysisDetail {
  score: number;
  reasoning: string;
}

export interface CVAnalysis {
  Experience: AnalysisDetail;
  "Hard Skills": AnalysisDetail;
  Education: AnalysisDetail;
  "Soft Skills": AnalysisDetail;
  "Diversity in experience": AnalysisDetail;
  Approximation: AnalysisDetail;
}

export interface CVMatch {
  fileName: string;
  matchScore: number;
  analysis: CVAnalysis;
}

export interface ResultWithId extends CVMatch {
  cacheId: string;
}

export interface FormState {
  serializedCVFilesBlob?: string;
  serializedJobDescriptionFileBlob?: string;
  extractedJobDescription?: string;
  jobDescription?: string;
  topCount?: number;
  results?: Array<CVMatch & { cacheId: string }>;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company?: string;
  dateOfBirth?: string;
}

export type SerializableFile = {
  name: string;
  type: string;
  size: number;
  content: string; // base64 encoded string
};

export type LoadCVFormStateSetters = {
  setcvFilesBlob: (cvFilesBlob: PutBlobResult[]) => void;
  setJDFileBlob: (jdFileBlob: PutBlobResult) => void;
  setExtractedJD: (extractedJd: string) => void;
  setJD: (jd: string) => void;
  setTopCount: (count: number) => void;
  setResults: (results: any[]) => void;
};
