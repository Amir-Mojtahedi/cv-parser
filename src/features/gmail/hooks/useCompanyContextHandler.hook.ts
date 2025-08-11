"use client";

import { useState, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import { type PutBlobResult } from "@vercel/blob";
import { convertFileToText } from "@/shared/utils";

export function useCompanyContextHandler() {
  const [contextText, setContextText] = useState("");
  const [contextFileBlob, setContextFileBlob] = useState<
    PutBlobResult | undefined
  >(undefined);
  const [isUploading, setIsUploading] = useState(false);

  const handleContextFileUpload = useCallback(
    async (event?: React.ChangeEvent<HTMLInputElement>) => {
      const file = event?.target.files?.[0];
      if (!file) {
        setContextFileBlob(undefined);
        setContextText("");
        return;
      }

      try {
        setIsUploading(true);
        const uploadedFile = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/company-context/upload",
        });
        setContextFileBlob(uploadedFile);

        const extension = uploadedFile.pathname.split(".").pop()?.toLowerCase();
        if (extension === "pdf" || extension === "docx") {
          const extractedText = await convertFileToText(uploadedFile.url);
          setContextText(extractedText || "");
        } else {
          setContextText("");
        }
      } catch (err) {
        console.error("Error uploading/extracting context file:", err);
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const resetContext = useCallback(() => {
    setContextText("");
    setContextFileBlob(undefined);
  }, []);

  return {
    contextText,
    contextFileBlob,
    isUploading,
    handleContextFileUpload,
    resetContext,
  };
}
