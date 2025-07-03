"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePDFJS } from "@/app/hooks/usePDFJS.hook";
import useFileHandler from "@/app/hooks/useFileHandler.hook";
import useJobDescriptionHandler from "@/app/hooks/useJobDescriptionHandler.hook";
import type * as PDFJS from "pdfjs-dist/types/src/pdf";
import { ResultWithId } from "@/app/types/types";
import {
  cacheAnalysis,
  clearFormStateCache,
} from "@/app/lib/redis/redisCacheService";
import { findTopCVMatches } from "@/app/lib/ai/atsService";
import {
  loadCVFormState,
  saveCVFormState,
  getCVFileFromCache,
} from "@/app/lib/helpers/hooks/cvMatcherHandlerUtils";

const useCVMatcherHandler = () => {
  const [pdfjsInstance, setPdfjsInstance] = useState<typeof PDFJS>();

  usePDFJS(
    useCallback(async (pdfjs) => {
      setPdfjsInstance(pdfjs);
    }, []),
    []
  );

  const {
    cvFiles,
    handleBulkCVFilesUpload,
    handleCVFileUpload,
    removeCVFile,
    removeAllCVFiles,
  } = useFileHandler();

  const {
    jobDescription,
    setJobDescription,
    extractedJobDescription,
    setExtractedJobDescription,
    jobDescriptionFile,
    setJobDescriptionFile,
    handleJobDescriptionFile,
    resetJobDescriptions,
  } = useJobDescriptionHandler(pdfjsInstance!);

  const router = useRouter();

  const [topCount, setTopCount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ResultWithId[]>([]);
  const [jobDescMode, setJobDescMode] = useState<"write" | "upload">("write");

  useEffect(() => {
    loadCVFormState({
      setCVs: handleBulkCVFilesUpload,
      setJDFile: setJobDescriptionFile,
      setExtractedJD: setExtractedJobDescription,
      setJD: setJobDescription,
      setTopCount,
      setResults,
    });
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      saveCVFormState({
        cvFiles,
        jobDescriptionFile,
        extractedJobDescription,
        jobDescription,
        topCount,
        results,
      });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    cvFiles,
    jobDescriptionFile,
    extractedJobDescription,
    jobDescription,
    topCount,
    results,
  ]);

  const handleModeChange = (mode: "write" | "upload") => {
    setJobDescMode(mode);
  };

  const resetForm = async () => {
    removeAllCVFiles();
    resetJobDescriptions();
    setTopCount(5);
    setResults([]);
    await clearFormStateCache();
  };

  const handleCVClick = (result: ResultWithId) => {
    router.push(`/dashboard/${result.cacheId}`);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    isJobDescription: boolean = false
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove(
      "border-blue-500",
      "bg-blue-50",
      "dark:bg-blue-900/20",
      "border-red-500",
      "bg-red-50",
      "dark:bg-red-900/20"
    );

    const files = Array.from(e.dataTransfer.files);
    const validTypes = isJobDescription
      ? [".txt", ".doc", ".docx", ".pdf"]
      : [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".pptx"];

    const validFiles = files.filter((file) =>
      validTypes.some((type) => file.name.toLowerCase().endsWith(type))
    );

    if (validFiles.length === 0) {
      alert(`Please drop only ${validTypes.join(", ")} files`);
      return;
    }

    if (isJobDescription) {
      const event = {
        target: { files: [validFiles[0]] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleJobDescriptionFile(event);
    } else {
      const event = {
        target: { files: validFiles },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleCVFileUpload(event);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const finalJobDescription =
        jobDescMode === "upload" ? extractedJobDescription : jobDescription;
      const matches = await findTopCVMatches(
        cvFiles,
        finalJobDescription,
        topCount
      );

      const resultsWithIds = await Promise.all(
        matches.map(async (match) => {
          const id = await cacheAnalysis(match);
          return { ...match, cacheId: id };
        })
      );

      setResults(resultsWithIds);
    } catch (error) {
      console.error("Error processing CVs:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCV = async (result: ResultWithId) => {
    try {
      const { fileName, fileBlob } = await getCVFileFromCache(result.fileName);
      const url = window.URL.createObjectURL(fileBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err)
      alert("Could not download file.");
    }
  };

  return {
    cvFiles,
    results,
    topCount,
    jobDescMode,
    isProcessing,
    jobDescription,
    jobDescriptionFile,
    setJobDescription,
    setTopCount,
    resetForm,
    removeCVFile,
    handleJobDescriptionFile,
    handleCVFileUpload,
    handleModeChange,
    handleCVClick,
    handleDrop,
    handleSubmit,
    handleDownloadCV,
  };
};

export default useCVMatcherHandler;
