"use client";

import { useState, useCallback, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { type PutBlobResult } from "@vercel/blob";
import { convertFileToText } from "@/shared/utils";
import {
  getCompanyContext,
  saveCompanyContext,
} from "@/features/database/supabase/gmailSupabaseService";

export function useCompanyContextHandler() {
  const [contextText, setContextText] = useState("");
  const [contextFileBlob, setContextFileBlob] = useState<PutBlobResult | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(true); // Added for better UX

  useEffect(() => {
    const retrieveCompanyContext = async () => {
      setIsLoadingContext(true);
      try {
        const companyContext = await getCompanyContext();
        if (companyContext?.companycontextbloburl) {
          const url = companyContext.companycontextbloburl;
          const extractedText = await convertFileToText(url);
          setContextText(extractedText || "");
          const pathname = new URL(url).pathname.substring(1);
          setContextFileBlob({
            url,
            pathname,
            contentType: "",
            contentDisposition: "",
            downloadUrl: url,
          });
        }
      } catch (error) {
        console.error("Failed to retrieve company context:", error);
      } finally {
        setIsLoadingContext(false);
      }
    };
    retrieveCompanyContext();
  }, []);

  const handleContextFileUpload = useCallback(
    async (event?: React.ChangeEvent<HTMLInputElement>) => {
      const file = event?.target.files?.[0];
      if (!file) {
        setContextFileBlob(null);
        setContextText("");
        return;
      }

      setIsUploading(true);
      try {
        const uploadedFile = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/company-context/upload",
        });

        await saveCompanyContext(uploadedFile.url);
        setContextFileBlob(uploadedFile);

        const extension = uploadedFile.pathname.split(".").pop()?.toLowerCase();
        if (extension === "pdf" || extension === "docx") {
          const extractedText = await convertFileToText(uploadedFile.url);
          setContextText(extractedText || "");
        } else {
          const text = await file.text();
          setContextText(text);
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
    setContextFileBlob(null);
  }, []);

  return {
    contextText,
    setContextText,
    contextFileBlob,
    isUploading,
    isLoadingContext,
    handleContextFileUpload,
    resetContext,
  };
}
