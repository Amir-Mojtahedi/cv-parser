"use server"

import pdf from "pdf-parse";

/**
 * @description
 * Extracts plain text content from a PDF file buffer.
 * It uses the 'pdf-parse' library, which is ideal for server-side execution.
 *
 * @param {Buffer} pdfBuffer The buffer of the input .pdf file.
 * @returns {Promise<string>} A promise that resolves with the extracted text.
 */
export async function convertPdfToText(pdfBuffer: Buffer) {
    try {
      const data = await pdf(pdfBuffer);
      return data.text.trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to extract text from PDF.");
    }
  }