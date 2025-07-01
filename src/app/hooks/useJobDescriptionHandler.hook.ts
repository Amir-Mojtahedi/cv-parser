"use client";

import { useState, useCallback } from "react";
import type * as PDFJS from "pdfjs-dist/types/src/pdf";
import { TextItem } from "pdfjs-dist/types/src/display/api";

const useJobDescriptionHandler = (pdfjsInstance: typeof PDFJS) => {
  const [jobDescription, setJobDescription] = useState("");
  const [extractedJobDescription, setExtractedJobDescription] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState<
    File | undefined
  >(undefined);

  const handleJobDescriptionFile = useCallback(
    async (event?: React.ChangeEvent<HTMLInputElement>) => {
      const file = event?.target.files?.[0];
      if (!file) {
        setJobDescriptionFile(undefined);
        setExtractedJobDescription("");
        return;
      }

      setJobDescriptionFile(file);

      const extension = file.name.split(".").pop()?.toLowerCase();

      try {
        if (extension === "pdf") {
          const typedArray = new Uint8Array(await file.arrayBuffer());

          if (!pdfjsInstance) {
            throw new Error("PDF.js instance not initialized");
          }

          const loadingTask = pdfjsInstance.getDocument(typedArray);
          const pdf = await loadingTask.promise;

          let fullText = "";

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const text = content.items
              .filter((item): item is TextItem => "str" in item)
              .map((item) => item.str)
              .join(" ");
            fullText += text + "\n";
          }

          setExtractedJobDescription(fullText);
        } else {
          // Fall back to text() for txt/docx/doc
          const text = await file.text();
          setExtractedJobDescription(text);
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    },
    [pdfjsInstance]
  );

  const resetJobDescriptions = useCallback(() => {
    setJobDescription("");
    setExtractedJobDescription("");
    setJobDescriptionFile(undefined);
  }, []);

  return {
    jobDescription,
    setJobDescription,
    extractedJobDescription,
    jobDescriptionFile,
    setJobDescriptionFile,
    handleJobDescriptionFile,
    resetJobDescriptions,
  };
};

export default useJobDescriptionHandler;
