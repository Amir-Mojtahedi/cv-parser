import { type PutBlobResult } from "@vercel/blob";
import { LoadCVFormStateSetters, ResultWithId } from "@/app/types/types";
import {
  cacheFormState,
  getFormStateFromCache,
} from "@/app/lib/redis/redisCacheService";

/**
 * Loads the form state from the cache and updates the UI using the provided setters.
 * @param {LoadCVFormStateSetters} setters - An object containing state setter functions from a React hook.
 */
async function loadCVFormState(setters: LoadCVFormStateSetters) {
  const savedState = await getFormStateFromCache();
  if (!savedState) return;

  if (savedState.serializedCVFilesBlob) {
    const cvFilesBlob: PutBlobResult[] = JSON.parse(savedState.serializedCVFilesBlob);
    setters.setcvFilesBlob(cvFilesBlob);
  }
  if (savedState.serializedJobDescriptionFileBlob) {
    const jobDescriptionFileBlob: PutBlobResult = JSON.parse(savedState.serializedJobDescriptionFileBlob);
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
 */
async function saveCVFormState(refs: {
  cvFilesBlob: PutBlobResult[];
  jobDescriptionFileBlob?: PutBlobResult;
  extractedJobDescription?: string;
  jobDescription: string;
  topCount: number;
  results: ResultWithId[];
}) {
  const serializedCVFilesBlob = JSON.stringify(refs.cvFilesBlob);
  const serializedJobDescriptionFileBlob = JSON.stringify(refs.jobDescriptionFileBlob);
  await cacheFormState({
    serializedCVFilesBlob,
    serializedJobDescriptionFileBlob,
    extractedJobDescription: refs.extractedJobDescription,
    jobDescription: refs.jobDescription,
    topCount: refs.topCount,
    results: refs.results,
  });
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
  const cvFilesBlob: PutBlobResult[] = JSON.parse(savedState.serializedCVFilesBlob);
  const fileBlobUrl = cvFilesBlob.find((cvFileBlobUrl) =>
    cvFileBlobUrl.pathname === fileName
  );
  if (!fileBlobUrl) {
    throw new Error("File not found");
  }
  return fileBlobUrl;
}

export { loadCVFormState, saveCVFormState, getCVFileFromCache };
