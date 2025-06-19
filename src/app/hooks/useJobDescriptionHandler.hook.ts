"use client";

import { useState, useCallback } from "react";
import type * as PDFJS from "pdfjs-dist/types/src/pdf";
import { TextItem } from "pdfjs-dist/types/src/display/api";

const useJobDescriptionHandler = (pdfjsInstance: typeof PDFJS) => {
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(
    null
  );

  const handleJobDescriptionFile = useCallback(async (
    event?: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event?.target.files?.[0];
    if (!file) {
      setJobDescriptionFile(null);
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

        setJobDescription(fullText);
      } else {
        // Fall back to text() for txt/docx/doc
        const text = await file.text();
        setJobDescription(text);
      }
    } catch (error) {
      console.error("Error reading file:", error);
    }
  }, [pdfjsInstance]);

  return {
    jobDescription,
    setJobDescription,
    jobDescriptionFile,
    setJobDescriptionFile,
    handleJobDescriptionFile,
  };
};

export default useJobDescriptionHandler;
