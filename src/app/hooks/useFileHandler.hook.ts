"use client";

import { useState, useCallback } from "react";
import { type PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";

const useFileHandler = () => {
  const [cvFilesBlob, setcvFilesBlob] = useState<PutBlobResult[]>([]);

  const handleCVFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedCVFiles = Array.from(event.target.files || []);
      const uploadedCVsPromise = selectedCVFiles.map((cvFile) => {
        return upload(cvFile.name, cvFile, {
          access: "public",
          handleUploadUrl: "/api/cv/upload",
        });
      });
      const uploadedCVs = await Promise.all(uploadedCVsPromise);
      setcvFilesBlob((prev) => [...prev, ...uploadedCVs]);
    },
    []
  );

  const handleBulkCVFilesUpload = useCallback(
    (cvFilesBlob: PutBlobResult[]) => {
      setcvFilesBlob(cvFilesBlob);
    },
    []
  );

  const removeCVFile = useCallback((index: number) => {
    setcvFilesBlob((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeAllCVFiles = useCallback(() => {
    setcvFilesBlob([]);
  }, []);

  return {
    cvFilesBlob,
    handleBulkCVFilesUpload,
    handleCVFileUpload,
    removeCVFile,
    removeAllCVFiles,
  };
};

export default useFileHandler;
