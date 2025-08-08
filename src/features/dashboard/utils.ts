import { type PutBlobResult } from "@vercel/blob";
import { LoadCVFormStateSetters } from "@/features/dashboard/types";
import { ResultWithId } from "@/shared/types";
import {
  cacheFormState,
  cacheJobDescMode,
  getFormStateFromCache,
} from "@/features/database/redis";

/**
 * Loads the form state from the cache and updates the UI using the provided setters.
 * @param {LoadCVFormStateSetters} setters - An object containing state setter functions from a React hook.
 */
async function loadCVFormState(setters: LoadCVFormStateSetters) {
  const savedState = await getFormStateFromCache();
  if (!savedState) return;

  if (savedState.serializedCVFilesBlob) {
    const cvFilesBlob: PutBlobResult[] = JSON.parse(
      savedState.serializedCVFilesBlob
    );
    setters.setcvFilesBlob(cvFilesBlob);
  }
  if (savedState.serializedJobDescriptionFileBlob) {
    const jobDescriptionFileBlob: PutBlobResult = JSON.parse(
      savedState.serializedJobDescriptionFileBlob
    );
    setters.setJDFileBlob(jobDescriptionFileBlob);
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
  if (savedState.jobDescMode) {
    setters.setJobDescMode(savedState.jobDescMode);
  }
}

/**
 * Saves the current form state to the cache.
 * The form state includes Vercel Blob URLs for uploaded files and other form data.
 * @param {object} refs - An object containing the current state values to be saved.
 * @param {string[]} refs.cvFilesBlob - Array of Vercel Blob URLs for CV files.
 * @param {string} [refs.jobDescriptionFileBlob] - The Vercel Blob URL for the job description file.
 * @param {string} [refs.extractedJobDescription] - The text extracted from the job description file.
 * @param {string} refs.jobDescription - The manually entered job description.
 * @param {number} refs.topCount - The number of top matches to find.
 * @param {ResultWithId[]} refs.results - The analysis results.
 * @param {"write" | "upload"} [refs.jobDescMode] - The mode used for analysis (set only once).
 */
async function saveCVFormState(refs: {
  cvFilesBlob: PutBlobResult[];
  jobDescriptionFileBlob?: PutBlobResult;
  extractedJobDescription?: string;
  jobDescription: string;
  topCount: number;
  results: ResultWithId[];
  jobDescMode: "write" | "upload";
}) {
  const serializedCVFilesBlob = JSON.stringify(refs.cvFilesBlob);
  const serializedJobDescriptionFileBlob = JSON.stringify(
    refs.jobDescriptionFileBlob
  );
  await cacheFormState({
    serializedCVFilesBlob,
    serializedJobDescriptionFileBlob,
    extractedJobDescription: refs.extractedJobDescription,
    jobDescription: refs.jobDescription,
    topCount: refs.topCount,
    results: refs.results,
    jobDescMode: refs.jobDescMode,
  });
}

async function saveJobDescMode(jobDescMode: "write" | "upload") {
  await cacheJobDescMode(jobDescMode);
}

/**
 * Retrieves a CV file's Vercel Blob URL from the cached form state by its file name.
 *
 * This function fetches the cached form state and searches for a Vercel Blob URL
 * that corresponds to the provided file name. The Blob URL can be used to
 * download or access the file directly from Vercel's blob storage.
 *
 * @param {string} fileName - The name of the CV file to retrieve from the cache.
 * @returns {Promise<string>} The Vercel Blob URL for the requested file.
 * @throws {Error} Throws if no cached CVs are found or if the specified file is not present in the cache.
 */
async function getCVFileFromCache(fileName: string) {
  const savedState = await getFormStateFromCache();
  if (!savedState || !savedState.serializedCVFilesBlob) {
    throw new Error("No CVs found");
  }
  const cvFilesBlob: PutBlobResult[] = JSON.parse(
    savedState.serializedCVFilesBlob
  );
  const fileBlobUrl = cvFilesBlob.find(
    (cvFileBlobUrl) => cvFileBlobUrl.pathname === fileName
  );
  if (!fileBlobUrl) {
    throw new Error("File not found");
  }
  return fileBlobUrl;
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

export {
  loadCVFormState,
  saveCVFormState,
  saveJobDescMode,
  getCVFileFromCache,
  handleDragLeave,
  handleDragOver,
};
