import type * as PDFJS from "pdfjs-dist/types/src/pdf";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import SerializableFile from "@/app/types/serializableFile";
import {
  cacheFormState,
  getFormStateFromCache,
} from "@/app/lib/redis/analysisCache";
import { CVMatch } from "@/app/lib/ai/types";

interface ResultWithId extends CVMatch {
  cacheId: string;
}

/**
 * Handles the drag-over event for a drag-and-drop area.
 * It prevents the default browser behavior and applies styling to indicate an active drop zone.
 * @param {React.DragEvent<HTMLDivElement>} e - The React drag event.
 */
const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add(
    "border-blue-500",
    "bg-blue-50",
    "dark:bg-blue-900/20"
  );
};

/**
 * Handles the drag-leave event for a drag-and-drop area.
 * It prevents the default browser behavior and removes active styling from the drop zone.
 * @param {React.DragEvent<HTMLDivElement>} e - The React drag event.
 */
const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove(
    "border-blue-500",
    "bg-blue-50",
    "dark:bg-blue-900/20"
  );
};

/**
 * Returns an emoji icon string corresponding to a file's extension.
 * @param {string} fileName - The full name of the file (e.g., "resume.pdf").
 * @returns {string} An emoji representing the file type.
 */
const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "txt":
      return "📋";
    case "png":
    case "jpg":
    case "jpeg":
      return "🖼️";
    case "pptx":
      return "📊";
    default:
      return "📎";
  }
};

/**
 * Converts a File object into a JSON-serializable object by Base64-encoding its content.
 * @param {File} file - The File object to serialize.
 * @returns {Promise<SerializableFile>} A promise that resolves to the serializable file object.
 */
async function serializeFile(file: File): Promise<SerializableFile> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    content: base64,
  };
}

/**
 * Reconstructs a File object from its serialized representation.
 * @param {SerializableFile} serialized - The serialized file object.
 * @returns {File} The reconstructed File object.
 */
function deserializeFile(serialized: SerializableFile): File {
  const binary = atob(serialized.content);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([array], { type: serialized.type });
  return new File([blob], serialized.name, {
    type: serialized.type,
    lastModified: Date.now(),
  });
}

type LoadCVFormStateSetters = {
  setCVs: (files: File[]) => void;
  setJDFile: (file: File) => void;
  setExtractedJD: (extractedJd: string) => void;
  setJD: (jd: string) => void;
  setTopCount: (count: number) => void;
  setResults: (results: any[]) => void;
};

/**
 * Loads the form state from the cache and updates the UI using the provided setters.
 * @param {LoadCVFormStateSetters} setters - An object containing state setter functions from a React hook.
 */
async function loadCVFormState(setters: LoadCVFormStateSetters) {
  const savedState = await getFormStateFromCache();
  if (!savedState) return;

  const deserializedCVFiles =
    savedState.serializedCVFiles?.map(deserializeFile);

  if (deserializedCVFiles) {
    setters.setCVs(deserializedCVFiles);
  }
  if (savedState.serializedJobDescriptionFile) {
    const deserializedJobDescriptionFile = deserializeFile(
      savedState.serializedJobDescriptionFile
    );
    setters.setJDFile(deserializedJobDescriptionFile);
  }
  if (savedState.extractedJobDescription) {
    setters.setExtractedJD(savedState.extractedJobDescription);
  }
  if (savedState.jobDescription) {
    setters.setJD(savedState.jobDescription);
  }
  if (savedState.topCount) {
    setters.setTopCount(savedState.topCount);
  }
  if (savedState.results) {
    setters.setResults(savedState.results);
  }
}

/**
 * Saves the current form state to the cache.
 * It serializes any files before caching the complete state.
 * @param {object} refs - An object containing the current state values to be saved.
 * @param {File[]} refs.cvFiles - Array of CV files.
 * @param {File} [refs.jobDescriptionFile] - The job description file.
 * @param {string} [refs.extractedJobDescription] - The text extracted from the job description file.
 * @param {string} refs.jobDescription - The manually entered job description.
 * @param {number} refs.topCount - The number of top matches to find.
 * @param {ResultWithId[]} refs.results - The analysis results.
 */
async function saveCVFormState(refs: {
  cvFiles: File[];
  jobDescriptionFile?: File;
  extractedJobDescription?: string;
  jobDescription: string;
  topCount: number;
  results: ResultWithId[];
}) {
  const serializedCVFiles = await Promise.all(
    refs.cvFiles.map((cvFile) => serializeFile(cvFile))
  );

  const serializedJobDescriptionFile = refs.jobDescriptionFile
    ? await serializeFile(refs.jobDescriptionFile)
    : undefined;

  await cacheFormState({
    serializedCVFiles,
    serializedJobDescriptionFile,
    extractedJobDescription: refs.extractedJobDescription,
    jobDescription: refs.jobDescription,
    topCount: refs.topCount,
    results: refs.results,
  });
}

/**
 * Parses a PDF file and extracts its text content.
 * @param {PDFJS} pdfjsInstance - The initialized PDF.js library instance.
 * @param {File} [file] - The PDF file to process.
 * @returns {Promise<string>} A promise that resolves with the extracted text.
 */
async function extractTextFromPDF(
  pdfjsInstance: typeof PDFJS,
  file: File
): Promise<string> {
  if (!pdfjsInstance) {
    throw new Error("PDF.js instance has not been initialized.");
  }

  const typedArray = new Uint8Array(await file.arrayBuffer());

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

  return fullText;
}

export {
  handleDragLeave,
  handleDragOver,
  getFileIcon,
  serializeFile,
  deserializeFile,
  loadCVFormState,
  saveCVFormState,
  extractTextFromPDF,
};
