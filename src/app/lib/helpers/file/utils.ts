import mammoth from "mammoth";
import { SerializableFile } from "@/app/types/types";

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
 * Converts a DOCX file buffer to plain text using mammoth.
 * @param {Buffer} docxBuffer The DOCX buffer.
 * @returns {Promise<string>} The extracted plain text.
 */
async function convertDocxToText(docxBuffer: Buffer): Promise<string> {
  try {
    const { value: text } = await mammoth.extractRawText({
      buffer: docxBuffer,
    });
    return text.trim();
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text.");
  }
}

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

export {
  serializeFile,
  deserializeFile,
  getFileIcon,
  convertDocxToText,
  combineCVTextsForPrompt,
};
