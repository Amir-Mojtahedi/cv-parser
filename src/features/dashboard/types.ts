import { type PutBlobResult } from "@vercel/blob";

export type LoadCVFormStateSetters = {
  setcvFilesBlob: (cvFilesBlob: PutBlobResult[]) => void;
  setJDFileBlob: (jdFileBlob: PutBlobResult) => void;
  setExtractedJD: (extractedJd: string) => void;
  setJD: (jd: string) => void;
  setTopCount: (count: number) => void;
  setResults: (results: any[]) => void;
};
