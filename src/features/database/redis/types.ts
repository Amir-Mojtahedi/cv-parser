import { CVMatch } from "@/shared/types";

export interface FormState {
  serializedCVFilesBlob?: string;
  serializedJobDescriptionFileBlob?: string;
  extractedJobDescription?: string;
  jobDescription?: string;
  topCount?: number;
  results?: Array<CVMatch & { cacheId: string }>;
}
