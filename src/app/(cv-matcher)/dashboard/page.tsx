"use client";

import type React from "react";
import useCVMatcherHandler from "@/app/hooks/useCVMatcherHandler.hook";
import {
  handleDragLeave,
  handleDragOver,
} from "@/app/lib/helpers/dashboard/utils";
import { getFileIcon } from "@/app/lib/helpers/file/utils";
import {
  Upload,
  FileText,
  Briefcase,
  Users,
  Eye,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Skeleton from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/radix-components/separator";
import { Button } from "@/components/ui/radix-components/button";
import { Label } from "@/components/ui/radix-components/label";
import { Badge } from "@/components/ui/radix-components/badge";

export default function CVMatcher() {
  const {
    cvFilesBlob,
    results,
    topCount,
    jobDescMode,
    isProcessing,
    jobDescription,
    jobDescriptionFileBlob,
    setJobDescription,
    setTopCount,
    resetForm,
    removeCVFile,
    handlejobDescriptionFileBlob,
    handleCVFileUpload,
    handleModeChange,
    handleCVClick,
    handleDrop,
    handleSubmit,
    handlePreviewCV,
    handleDownloadCV,
  } = useCVMatcherHandler();

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
                      accept=".pdf,.docx"
                      onChange={handleCVFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload CVs or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        PDF, DOCX files supported
                      </p>
                    </label>
                  </div>

                  {cvFilesBlob.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {cvFilesBlob.map((cvFileBlob, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded"
                        >
                          <span className="text-sm truncate">
                            {cvFileBlob.pathname.replace(
                              /-[\w\d]{20,}(?=\.\w+$)/,
                              ""
                            )}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCVFile(index)}
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
                  <Label className="text-sm font-medium">Job Description</Label>
                  {/* Mode Switcher */}
                  <div className="flex gap-2 mb-2">
                    <Button
                      type="button"
                      variant={jobDescMode === "write" ? "default" : "outline"}
                      onClick={() => handleModeChange("write")}
                    >
                      Write
                    </Button>
                    <Button
                      type="button"
                      variant={jobDescMode === "upload" ? "default" : "outline"}
                      onClick={() => handleModeChange("upload")}
                    >
                      Upload
                    </Button>
                  </div>
                  {/* Conditional UI */}
                  {jobDescMode === "write" ? (
                    <Textarea
                      id="job-description"
                      placeholder="Paste the job description here..."
                      onChange={(e) => setJobDescription(e.target.value)}
                      value={jobDescription}
                      className="min-h-[150px] max-h-[300px] overflow-y-auto resize-none"
                    />
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, true)}
                    >
                      <input
                        id="job-description-file"
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => handlejobDescriptionFileBlob(e)}
                        className="hidden"
                      />
                      <label
                        htmlFor="job-description-file"
                        className="cursor-pointer"
                      >
                        <FileText className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload a job description or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          PDF files supported
                        </p>
                      </label>
                    </div>
                  )}

                  {jobDescriptionFileBlob && jobDescMode === "upload" && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <span className="text-sm truncate">
                          {jobDescriptionFileBlob.pathname.replace(
                            /-[\w\d]{20,}(?=\.\w+$)/,
                            ""
                          )}
                        </span>
                      </div>
                    </div>
                  )}
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
                    max={cvFilesBlob.length || 100}
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
                      cvFilesBlob.length === 0 ||
                      !(jobDescription.trim() || jobDescriptionFileBlob) ||
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
          {isProcessing ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Matching Results
                </CardTitle>
                <CardDescription>
                  Processing CVs and finding best matches...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {cvFilesBlob.map((_, idx) => (
                  <div key={idx} className="space-y-4">
                    {idx > 0 && <Separator />}
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
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
                            {result.fileName.replace(
                              /-[\w\d]{20,}(?=\.\w+$)/,
                              ""
                            )}
                          </h3>
                          <Badge variant="secondary" className="text-sm mt-1">
                            {result.matchScore}% Match
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const isPdf = result.fileName.toLowerCase().endsWith('.pdf');
                          return (
                            <button
                              type="button"
                              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${!isPdf ? 'cursor-not-allowed' : ''}`}
                              title="Preview CV"
                              onClick={() => isPdf && handlePreviewCV(result)}
                              disabled={!isPdf}
                            >
                              <Eye className={`h-5 w-5 ${isPdf ? 'text-blue-500' : 'text-gray-400'}`} />
                            </button>
                          );
                        })()}
                        <button
                          type="button"
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Download CV"
                          onClick={() => handleDownloadCV(result)}
                        >
                          <Download className="h-5 w-5 text-green-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
