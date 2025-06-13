"use client";

import { useEffect, useState } from "react";
import type * as PDFJS from "pdfjs-dist/types/src/pdf";

/**
 * Dynamically loads PDF.js and runs the callback when ready
 */
export const usePDFJS = (
  onLoad: (pdfjs: typeof PDFJS) => Promise<void>,
  deps: (string | number | boolean | undefined | null)[] = []
) => {
  const [pdfjs, setPDFJS] = useState<typeof PDFJS | null>(null);

  useEffect(() => {
    import("pdfjs-dist/webpack.mjs").then(setPDFJS).catch(console.error);
  }, []);

  useEffect(() => {
    if (!pdfjs) return;
    (async () => await onLoad(pdfjs))();
  }, [pdfjs, onLoad, ...deps]);
};
