"use client";

import { useState, useCallback } from "react";
import axios from "axios";
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
          const response = await axios.post(
            "/api/job-description/extract",
            {
              fileUrl: uploadedJobDescriptionFile.url,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setExtractedJobDescription(response.data.text || "");
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
