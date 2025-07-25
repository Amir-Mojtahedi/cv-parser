import { SerializableFile } from "@/shared/types";
import axios from "axios";

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
 * Splits an array of CV texts into groups of `batchSize`,
 * each group combined into a single formatted string.
 * Returns a map where the key is a comma-separated string of the file names in the batch,
 * and the value is the concatenated CV text for that batch.
 *
 * @param {Array<{ fileName: string; cvText: string }>} cvFiles - Array of CVs with their filename and text.
 * @param {number} batchSize - Number of cvs per group (default: 5).
 * @returns {Record<string, string>} An object where each key is a comma-separated list of file names, and the value is the combined CV text.
 */
function combineCVTextsForPrompt(
  cvFiles: { fileName: string; cvText: string }[],
  batchSize: number = 5
): Record<string, string> {
  const batchMap: Record<string, string> = {};

  for (let i = 0; i < cvFiles.length; i += batchSize) {
    const batch = cvFiles.slice(i, i + batchSize);

    const fileNamesKey = batch.map((cv) => cv.fileName).join(",");
    const combinedText = batch
      .map((cv) => `--- CV ${cv.fileName} ---\n${cv.cvText.trim()}`)
      .join("\n\n");

    batchMap[fileNamesKey] = combinedText;
  }

  return batchMap;
}

/**
 * Extracts text content from a file by sending its blob URL to an external file parsing service.
 *
 * This function supports extracting text from various file types (e.g., PDF, DOCX) by making a POST request
 * to the file parser service endpoint defined in the environment variable `NEXT_PUBLIC_FILE_PARSER_URL`.
 *
 * @async
 * @function convertFileToText
 * @param {string} blobUrl - The public URL of the uploaded file (e.g., from Vercel Blob storage).
 * @returns {Promise<string>} A promise that resolves to the extracted text content of the file, or an empty string if extraction fails.
 * @throws {Error} Throws an error if the extraction service fails or returns an error response.
 *
 * @example
 * const text = await convertFileToText("https://my-storage.vercel.app/file.pdf");
 * console.log(text); // Extracted file text
 */
async function convertFileToText(blobUrl: string): Promise<string> {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_FILE_PARSER_URL}/extract`,
      { fileUrl: blobUrl },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data.text?.trim() || "";
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data || error.message;
      console.error(`Failed to extract file text: ${errorMsg}`);
    } else {
      console.error("Error calling FastAPI PDF extractor:", error);
    }
    throw new Error("PDF extraction service failed.");
  }
}

export {
  serializeFile,
  deserializeFile,
  getFileIcon,
  combineCVTextsForPrompt,
  convertFileToText,
};
