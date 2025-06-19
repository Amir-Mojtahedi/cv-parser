"use client";

import { useEffect, useState, useCallback } from "react";
import { usePDFJS } from "@/app/hooks/usePDFJS.hook";
import useFileHandler from "@/app/hooks/useFileHandler.hook";
import useJobDescriptionHandler from "@/app/hooks/useJobDescriptionHandler.hook";
import {
  cacheAnalysis,
  cacheFormState,
  getFormState,
  clearFormState,
} from "@/app/lib/reddis/analysisCache";
import { findTopCVMatches } from "@/app/lib/ai/atsService";
import { useRouter } from "next/navigation";
import type * as PDFJS from "pdfjs-dist/types/src/pdf";
import { CVMatch } from "@/app/lib/ai/types";

interface ResultWithId extends CVMatch {
  cacheId: string;
}

const useCVMatcherHandler = () => {
  const [pdfjsInstance, setPdfjsInstance] = useState<typeof PDFJS>();

  usePDFJS(
    useCallback(async (pdfjs) => {
      setPdfjsInstance(pdfjs);
    }, []),
    []
  );

  const { files, handleFileUpload, removeFile, removeAllFiles } = useFileHandler();
  const {
    jobDescription,
    setJobDescription,
    jobDescriptionFile,
    setJobDescriptionFile,
    handleJobDescriptionFile,
  } = useJobDescriptionHandler(pdfjsInstance!);

  const router = useRouter();
  const [topCount, setTopCount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ResultWithId[]>([]);

  // Load saved form state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      const savedState = await getFormState();
      if (savedState) {
        setJobDescription(savedState.jobDescription);
        setTopCount(savedState.topCount);
        setResults(savedState.results);
      }
    };
    loadSavedState();
  }, [setJobDescription]);

  // Save form state when it changes
  useEffect(() => {
    const saveState = async () => {
      if (jobDescription || results.length > 0) {
        await cacheFormState({
          jobDescription,
          topCount,
          results,
        });
      }
    };
    saveState();
  }, [jobDescription, topCount, results]);

  const resetForm = useCallback(async () => {
    removeAllFiles();
    setJobDescription("");
    setJobDescriptionFile(null);
    setTopCount(5);
    setResults([]);
    await clearFormState();
  }, [removeAllFiles, setJobDescription, setJobDescriptionFile]);

  const handleCVClick = useCallback(
    (result: ResultWithId) => {
      router.push(`/dashboard/${result.cacheId}`);
    },
    [router]
  );

  const handleDrop = useCallback(
    (
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
        handleFileUpload(event);
      }
    },
    [handleFileUpload, handleJobDescriptionFile]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);

      try {
        const matches = await findTopCVMatches(files, jobDescription, topCount);

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
    },
    [files, jobDescription, topCount]
  );

  return {
    files,
    results,
    topCount,
    isProcessing,
    jobDescription,
    jobDescriptionFile,
    setJobDescription,
    setTopCount,
    resetForm,
    removeFile,
    handleJobDescriptionFile,
    handleFileUpload,
    handleCVClick,
    handleDrop,
    handleSubmit,
  };
};

export default useCVMatcherHandler;
