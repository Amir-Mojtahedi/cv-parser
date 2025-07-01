"use client";

import { useState, useCallback } from "react";

const useFileHandler = () => {
  const [cvFiles, setCVFiles] = useState<File[]>([]);

  const handleCVFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      setCVFiles((prev) => [...prev, ...selectedFiles]);
    },
    []
  );

  const handleBulkCVFilesUpload = useCallback((cvFiles: File[]) => {
    setCVFiles(cvFiles);
  }, []);

  const removeCVFile = useCallback((index: number) => {
    setCVFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeAllCVFiles = useCallback(() => {
    setCVFiles([]);
  }, []);

  return {
    cvFiles,
    handleBulkCVFilesUpload,
    handleCVFileUpload,
    removeCVFile,
    removeAllCVFiles,
  };
};

export default useFileHandler;
