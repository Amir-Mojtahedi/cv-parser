import mammoth from "mammoth";
import type * as PDFJS from "pdfjs-dist/types/src/pdf";
import { TextItem } from "pdfjs-dist/types/src/display/api";
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

export { serializeFile, deserializeFile, getFileIcon, extractTextFromPDF, convertDocxToText };
