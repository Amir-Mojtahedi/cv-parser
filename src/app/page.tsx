"use client"

import type React from "react"
import { useState } from "react"
import { Upload, FileText, Briefcase, Users, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { main } from '@/app/lib/ai/atsService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CVMatch {
  fileName: string;
  matchScore: number;
  fileUrl: string;
}

export default function CVMatcher() {
  const [files, setFiles] = useState<File[]>([])
  const [jobDescription, setJobDescription] = useState("")
  const [topCount, setTopCount] = useState(5)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<CVMatch[]>([])
  const [previewFile, setPreviewFile] = useState<CVMatch | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const matches = await main(files, jobDescription, topCount)
      setResults(matches)
    } catch (error) {
      console.error('Error processing CVs:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setFiles([])
    setJobDescription("")
    setTopCount(5)
    setResults([])
    setPreviewFile(null)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'txt':
        return '📋'
      case 'png':
      case 'jpg':
      case 'jpeg':
        return '🖼️'
      case 'pptx':
        return '📊'
      default:
        return '📎'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">CV Matcher</h1>
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
              <CardDescription>Upload CVs, provide job description, and set your preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="cv-upload" className="text-sm font-medium">
                    Upload CVs
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload CVs or drag and drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PDF, DOC, DOCX, TXT, PNG, JPG, PPTX files supported</p>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
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
                  <Label htmlFor="job-description" className="text-sm font-medium">
                    Job Description
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[150px]"
                    required
                  />
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
                    onChange={(e) => setTopCount(Number.parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={files.length === 0 || !jobDescription.trim() || isProcessing}
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
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(result.fileName)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{result.fileName}</h3>
                        <Badge variant="secondary" className="text-sm mt-1">
                          {result.matchScore}% Match
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewFile(result)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewFile?.fileName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewFile(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewFile && (
              <iframe
                src={previewFile.fileUrl}
                className="w-full h-full border-0"
                title={previewFile.fileName}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
