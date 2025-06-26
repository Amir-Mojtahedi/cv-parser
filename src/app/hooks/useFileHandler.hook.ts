"use client";

import { useState, useCallback } from "react";

const useFileHandler = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      setFiles((prev) => [...prev, ...selectedFiles]);
    },
    []
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeAllFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return { files, setFiles, handleFileUpload, removeFile, removeAllFiles };
};

export default useFileHandler;
