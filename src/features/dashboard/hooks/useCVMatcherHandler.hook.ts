"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useFileHandler from "@/features/dashboard/hooks/useFileHandler.hook";
import useJobDescriptionHandler from "@/features/dashboard/hooks/useJobDescriptionHandler.hook";
import { ResultWithId } from "@/shared/types";
import {
  cacheAnalysis,
  clearFormStateCache,
} from "@/features/database/redis";
import { findTopCVMatches } from "@/features/llm-analyzer/services/atsService";
// import { analyzeCVsWithLangflow } from "@/features/llm-analyzer/atsService";
import {
  loadCVFormState,
  saveCVFormState,
  getCVFileFromCache,
  saveJobDescMode,
} from "@/features/dashboard/utils";

const useCVMatcherHandler = () => {
  const {
    cvFilesBlob,
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
    jobDescriptionFileBlob,
    setjobDescriptionFileBlob,
    handlejobDescriptionFileBlob,
    resetJobDescriptions,
  } = useJobDescriptionHandler();

  const router = useRouter();

  const [topCount, setTopCount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ResultWithId[]>([]);
  const [jobDescMode, setJobDescMode] = useState<"write" | "upload">("upload");

  useEffect(() => {
    loadCVFormState({
      setcvFilesBlob: handleBulkCVFilesUpload,
      setJDFileBlob: setjobDescriptionFileBlob,
      setExtractedJD: setExtractedJobDescription,
      setJD: setJobDescription,
      setTopCount,
      setResults,
      setJobDescMode,
    });
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      saveCVFormState({
        cvFilesBlob,
        jobDescriptionFileBlob,
        extractedJobDescription,
        jobDescription,
        topCount,
        results,
        jobDescMode,
      });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    cvFilesBlob,
    jobDescriptionFileBlob,
    extractedJobDescription,
    jobDescription,
    topCount,
    results,
    jobDescMode,
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
      handlejobDescriptionFileBlob(event);
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

      await saveJobDescMode(jobDescMode);

      const matches = await findTopCVMatches(
        cvFilesBlob,
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

  const handlePreviewCV = async (result: ResultWithId) => {
    try {
      const cvFileBlob = await getCVFileFromCache(result.fileName);
      if (!cvFileBlob) {
        throw new Error("File URL could not be retrieved.");
      }
      window.open(cvFileBlob.url, "_blank");
    } catch (err) {
      console.error("Preview failed:", err);
      alert("Could not preview the file.");
    }
  };

  const handleDownloadCV = async (result: ResultWithId) => {
    try {
      const cvFileBlob = await getCVFileFromCache(result.fileName);
      if (!cvFileBlob) {
        throw new Error("File URL could not be retrieved.");
      }
      const a = document.createElement("a");
      a.href = cvFileBlob.downloadUrl;
      a.download = result.fileName.replace(/-[\w\d]{20,}(?=\.\w+$)/, "");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Could not download the file.");
    }
  };

  return {
    cvFilesBlob,
    results,
    topCount,
    jobDescMode,
    isProcessing,
    jobDescription,
    jobDescriptionFileBlob,
    setJobDescription,
    setTopCount,
    resetForm,
    removeCVFile,
    handlejobDescriptionFileBlob,
    handleCVFileUpload,
    handleModeChange,
    handleCVClick,
    handleDrop,
    handleSubmit,
    handlePreviewCV,
    handleDownloadCV,
  };
};

export default useCVMatcherHandler;
