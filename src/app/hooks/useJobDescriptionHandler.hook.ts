"use client";

import { useState, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import { type PutBlobResult } from "@vercel/blob";
import type * as PDFJS from "pdfjs-dist/types/src/pdf";
import { extractTextFromPDF } from "@/app/lib/helpers/file/utils";

const useJobDescriptionHandler = (pdfjsInstance: typeof PDFJS) => {
  const [jobDescription, setJobDescription] = useState("");
  const [extractedJobDescription, setExtractedJobDescription] = useState("");
  const [jobDescriptionFileBlob, setjobDescriptionFileBlob] = useState<
    PutBlobResult | undefined
  >(undefined);

  const handlejobDescriptionFileBlob = useCallback(
    async (event?: React.ChangeEvent<HTMLInputElement>) => {
      const jobDescriptionFile = event?.target.files?.[0];
      if (!jobDescriptionFile) {
        setjobDescriptionFileBlob(undefined);
        setExtractedJobDescription("");
        return;
      }
      const uploadedJobDescriptionFile = await upload(
        jobDescriptionFile.name,
        jobDescriptionFile,
        {
          access: "public",
          handleUploadUrl: "/api/job-description/upload",
        }
      );
      setjobDescriptionFileBlob(uploadedJobDescriptionFile);
      const extension = uploadedJobDescriptionFile.pathname
        .split(".")
        .pop()
        ?.toLowerCase();
      try {
        if (extension === "pdf") {
          const fileName =
            uploadedJobDescriptionFile.url.split("/").pop() ||
            uploadedJobDescriptionFile.url;
          const response = await fetch(uploadedJobDescriptionFile.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const mimeType =
            response.headers.get("Content-Type") || "application/octet-stream";

          const file = new File([arrayBuffer], fileName, { type: mimeType });
          const fullText = await extractTextFromPDF(pdfjsInstance, file);

          setExtractedJobDescription(fullText);
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
    setjobDescriptionFileBlob(undefined);
  }, []);

  return {
    jobDescription,
    setJobDescription,
    extractedJobDescription,
    setExtractedJobDescription,
    jobDescriptionFileBlob,
    setjobDescriptionFileBlob,
    handlejobDescriptionFileBlob,
    resetJobDescriptions,
  };
};

export default useJobDescriptionHandler;
