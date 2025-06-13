"use client";

import type React from "react";
import { usePDFJS } from "@/app/hooks/usePDFJS.hook"; // 👈 Adjust path as needed
import { useState, useEffect } from "react";
import { Upload, FileText, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { findTopCVMatches } from "@/app/lib/ai/atsService";
import { useRouter } from "next/navigation";
import { CVMatch } from "@/app/lib/ai/types";
import {
  cacheAnalysis,
  cacheFormState,
  getFormState,
  clearFormState,
} from "@/app/lib/analysisCache";
import type * as PDFJS from "pdfjs-dist/types/src/pdf";
import { TextItem } from "pdfjs-dist/types/src/display/api";

interface ResultWithId extends CVMatch {
  cacheId: string;
}

export default function CVMatcher() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(
    null
  );
  const [topCount, setTopCount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ResultWithId[]>([]); // <-- USE THE NEW TYPE
  const [pdfjsInstance, setPdfjsInstance] = useState<typeof PDFJS>();

  usePDFJS(async (pdfjs) => {
    setPdfjsInstance(pdfjs);
  }, []);

  // Load saved form state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      const savedState = await getFormState();
      if (savedState) {
        setJobDescription(savedState.jobDescription);
        setTopCount(savedState.topCount);
        setResults(savedState.results);
      }
    };
    loadSavedState();
  }, []);

  // Save form state when it changes
  useEffect(() => {
    const saveState = async () => {
      if (jobDescription || results.length > 0) {
        await cacheFormState({
          jobDescription,
          topCount,
          results,
        });
      }
    };
    saveState();
  }, [jobDescription, topCount, results]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleJobDescriptionFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setJobDescriptionFile(file);

    const extension = file.name.split(".").pop()?.toLowerCase();

    try {
      if (extension === "pdf") {
        const typedArray = new Uint8Array(await file.arrayBuffer());

        if (!pdfjsInstance) {
          throw new Error('PDF.js instance not initialized');
        }

        const loadingTask = pdfjsInstance.getDocument(typedArray);
        const pdf = await loadingTask.promise;

        let fullText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const text = content.items
            .filter((item): item is TextItem => 'str' in item)
            .map(item => item.str)
            .join(" ");
          fullText += text + "\n";
        }

        setJobDescription(fullText);
      } else {
        // Fall back to text() for txt/docx/doc
        const text = await file.text();
        setJobDescription(text);
      }
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const matches = await findTopCVMatches(files, jobDescription, topCount);

      // The map function must now handle promises
      const resultsWithIds = await Promise.all(
        matches.map(async (match) => {
          // This is now an async operation
          const id = await cacheAnalysis(match);
          return { ...match, cacheId: id };
        })
      );

      setResults(resultsWithIds);
    } catch (error) {
      console.error("Error processing CVs:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = async () => {
    setFiles([]);
    setJobDescription("");
    setJobDescriptionFile(null);
    setTopCount(5);
    setResults([]);
    await clearFormState();
  };

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

  const handleCVClick = (result: ResultWithId) => {
    // Navigate using the simple, clean cache ID. No more large data in URL!
    router.push(`/dashboard/${result.cacheId}`);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, isJobDescription: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20', 'border-red-500', 'bg-red-50', 'dark:bg-red-900/20');

    const files = Array.from(e.dataTransfer.files);
    const validTypes = isJobDescription 
      ? ['.txt', '.doc', '.docx', '.pdf']
      : ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.pptx'];
    
    const validFiles = files.filter(file => 
      validTypes.some(type => file.name.toLowerCase().endsWith(type))
    );

    if (validFiles.length === 0) {
      // Show error message
      alert(`Please drop only ${validTypes.join(', ')} files`);
      return;
    }

    if (isJobDescription) {
      const event = { target: { files: [validFiles[0]] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleJobDescriptionFile(event);
    } else {
      const event = { target: { files: validFiles } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            CV Matcher
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload CVs and find the best matches for your job description
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload & Configure
              </CardTitle>
              <CardDescription>
                Upload CVs, provide job description, and set your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="cv-upload" className="text-sm font-medium">
                    Upload CVs
                  </Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e)}
                  >
                    <input
                      id="cv-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload CVs or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        PDF, DOC, DOCX, TXT, PNG, JPG, PPTX files supported
                      </p>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded"
                        >
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="job-description"
                    className="text-sm font-medium"
                  >
                    Job Description
                  </Label>
                  <div className="space-y-2">
                    <div 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, true)}
                    >
                      <input
                        id="job-description-file"
                        type="file"
                        accept=".txt,.doc,.docx,.pdf"
                        onChange={handleJobDescriptionFile}
                        className="hidden"
                      />
                      <label
                        htmlFor="job-description-file"
                        className="cursor-pointer"
                      >
                        <FileText className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {jobDescriptionFile
                            ? jobDescriptionFile.name
                            : "Upload job description file or drag and drop"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          TXT, DOC, DOCX, PDF files supported
                        </p>
                      </label>
                    </div>
                    <Textarea
                      id="job-description"
                      placeholder="Or paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[150px] max-h-[300px] overflow-y-auto resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Top N Results */}
                <div className="space-y-2">
                  <Label htmlFor="top-count" className="text-sm font-medium">
                    Number of top CVs to return
                  </Label>
                  <Input
                    id="top-count"
                    type="number"
                    min="1"
                    max={files.length || 100}
                    value={topCount}
                    onChange={(e) =>
                      setTopCount(Number.parseInt(e.target.value) || 1)
                    }
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={
                      files.length === 0 ||
                      !jobDescription.trim() ||
                      isProcessing
                    }
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-4 w-4 mr-2" />
                        Find Matches
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Matching Results
              </CardTitle>
              <CardDescription>
                {results.length > 0
                  ? `Found ${results.length} matching candidates`
                  : "Upload CVs and provide a job description to see matches"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="space-y-4">
                  {index > 0 && <Separator />}
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCVClick(result)}
                    >
                      <span className="text-2xl">
                        {getFileIcon(result.fileName)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {result.fileName}
                        </h3>
                        <Badge variant="secondary" className="text-sm mt-1">
                          {result.matchScore}% Match
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
