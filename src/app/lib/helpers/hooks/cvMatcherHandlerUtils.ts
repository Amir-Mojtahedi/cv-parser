import { LoadCVFormStateSetters, ResultWithId } from "@/app/types/types";
import {
  cacheFormState,
  getFormStateFromCache,
} from "@/app/lib/redis/redisCacheService";
import { deserializeFile, serializeFile } from "@/app/lib/helpers/file/utils";

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
 * Retrieves a CV file from the cached form state by its file name.
 *
 * This function fetches the cached form state, searches for a serialized CV file
 * matching the provided file name, and reconstructs it as a File object.
 * It returns an object containing the file's name and a Blob representing the file's contents,
 * which can be used for downloading or further processing.
 *
 * @param {string} fileName - The name of the CV file to retrieve from the cache.
 * @returns {Promise<{ fileName: string; fileBlob: Blob }>}
 *   Resolves with an object containing:
 *     - fileName: The name of the retrieved file.
 *     - fileBlob: A Blob (File) object containing the file's data.
 * @throws {Error} Throws if no cached CVs are found or if the specified file is not present in the cache.
 */
async function getCVFileFromCache(fileName: string) {
  const formState = await getFormStateFromCache();
  if (!formState || !formState.serializedCVFiles) {
    throw new Error("No CVs found");
  }
  const file = formState.serializedCVFiles.find((f) => f.name === fileName);
  if (!file) {
    throw new Error("File not found");
  }
  // Use deserializeFile to reconstruct the File object
  const reconstructedFile = deserializeFile(file);
  return {
    fileName: reconstructedFile.name,
    fileBlob: reconstructedFile,
  };
}

export { loadCVFormState, saveCVFormState, getCVFileFromCache };
