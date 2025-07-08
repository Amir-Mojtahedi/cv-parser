"use client";

import { useState, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import { type PutBlobResult } from "@vercel/blob";

const useJobDescriptionHandler = () => {
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
          const response = await fetch("/api/job-description/extract", {
            method: "POST",
            body: (() => {
              const formData = new FormData();
              formData.append("file", jobDescriptionFile);
              return formData;
            })(),
          });
          if (!response.ok) {
            throw new Error(`Failed to extract text: ${response.statusText}`);
          }
          const data = await response.json();
          setExtractedJobDescription(data.text || "");
        } else {
          setExtractedJobDescription("");
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    },
    []
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
