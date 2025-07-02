"use client";

import { useState, useCallback } from "react";
import type * as PDFJS from "pdfjs-dist/types/src/pdf";
import { extractTextFromPDF } from "@/app/lib/helpers/dashboard/utils";

const useJobDescriptionHandler = (pdfjsInstance: typeof PDFJS) => {
  const [jobDescription, setJobDescription] = useState("");
  const [extractedJobDescription, setExtractedJobDescription] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState<
    File | undefined
  >(undefined);

  const handleJobDescriptionFile = useCallback(
    async (event?: React.ChangeEvent<HTMLInputElement>) => {
      const file = event?.target.files?.[0];
      if (!file) {
        setJobDescriptionFile(undefined);
        setExtractedJobDescription("");
        return;
      }
      setJobDescriptionFile(file);
      const extension = file.name.split(".").pop()?.toLowerCase();
      try {
        if (extension === "pdf") {
          const fullText = await extractTextFromPDF(pdfjsInstance, file);

          setExtractedJobDescription(fullText);
        } else {
          // Fall back to text() for txt/docx/doc
          const text = await file.text();
          setExtractedJobDescription(text);
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    },
    [pdfjsInstance]
  );

  const resetJobDescriptions = useCallback(() => {
    setJobDescription("");
    setExtractedJobDescription("");
    setJobDescriptionFile(undefined);
  }, []);

  return {
    jobDescription,
    setJobDescription,
    extractedJobDescription,
    setExtractedJobDescription,
    jobDescriptionFile,
    setJobDescriptionFile,
    handleJobDescriptionFile,
    resetJobDescriptions,
  };
};

export default useJobDescriptionHandler;
