"use server";

import axios from "axios";

/**
 * Extracts text from a PDF file by sending its blob URL to a FastAPI service.
 *
 * @async
 * @function convertPdfToText
 * @param {string} blobUrl - The Vercel blob URL of the uploaded PDF.
 * @returns {Promise<string>} A promise that resolves to the extracted PDF text.
 * @throws {Error} If the extraction service fails or returns an error.
 */
export async function convertPdfToText(blobUrl: string): Promise<string> {
  try {
    const response = await axios.post(
      `${process.env.PDF_PARSER_URL}/extract`,
      { fileUrl: blobUrl },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;
    return data.pdfText?.trim() || "";
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data || error.message;
      console.error(`Failed to extract PDF text: ${errorMsg}`);
    } else {
      console.error("Error calling FastAPI PDF extractor:", error);
    }
    throw new Error("PDF extraction service failed.");
  }
}
