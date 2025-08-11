"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Upload,
  Play,
  History,
  Clock,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from "@/shared";
import { GmailBotResponse } from "@/features/llm-analyzer/types";

interface AutomationPanelProps {
  isVisible: boolean;
  showHistory?: boolean;
}

export function AutomationPanel({
  isVisible,
  showHistory = false,
}: AutomationPanelProps) {
  const [companyContext, setCompanyContext] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<GmailBotResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showHistory) {
      fetchCachedResponses();
    }
  }, [showHistory]);

  const processEmails = async () => {
    if (!companyContext.trim()) {
      alert("Please provide company context first.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/gmail/automate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyContext }),
      });

      if (!response.ok) {
        throw new Error("Failed to process emails");
      }

      const data = await response.json();
      setResults(data.results || []);

      // Refresh history if we're in history view
      if (showHistory) {
        fetchCachedResponses();
      }
    } catch (error) {
      console.error("Error processing emails:", error);
      alert("Failed to process emails. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchCachedResponses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/gmail/automate");
      if (response.ok) {
        const data = await response.json();
        setResults(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "reply":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "forward":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "ignore":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const renderResponseCard = (result: GmailBotResponse, index: number) => (
    <div key={index} className="space-y-4">
      {index > 0 && <Separator />}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {result.subject}
              </h4>
              <Badge
                variant="secondary"
                className={getPriorityColor(result.priority)}
              >
                {result.priority}
              </Badge>
              <Badge
                variant="secondary"
                className={getResponseTypeColor(result.responseType)}
              >
                {result.responseType}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              From: {result.from}
            </p>
            {result.sentAt && (
              <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(result.sentAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {result.shouldRespond ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>Reasoning:</strong> {result.responseReasoning}
          </p>
          {result.responseBody && (
            <div className="mt-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                <strong>Response:</strong>
              </p>
              <div className="bg-white dark:bg-gray-700 rounded p-2 text-sm">
                {result.responseBody}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {!showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Company Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload Company Context File
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setCompanyContext(e.target?.result as string);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                  id="company-context-upload"
                />
                <label
                  htmlFor="company-context-upload"
                  className="cursor-pointer"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload company context or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    PDF, TXT, DOC, DOCX files supported
                  </p>
                </label>
              </div>
            </div>

            {/* Manual Input Option */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Or type company context manually
              </label>
              <textarea
                value={companyContext}
                onChange={(e) => setCompanyContext(e.target.value)}
                placeholder="Enter company context, mission, values, or any relevant information..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Process Button */}
            <Button
              onClick={processEmails}
              disabled={!companyContext.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing Emails...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Process Emails
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {showHistory ? (
                <>
                  <History className="h-5 w-5" />
                  <span>Automation History</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  <span>Processing Results</span>
                </>
              )}
              <Badge variant="secondary">{results.length} emails</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Loading...
                </span>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((result, index) =>
                  renderResponseCard(result, index)
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!showHistory && results.length === 0 && companyContext && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to Process Emails
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Company context is loaded. Click "Process Emails" to start
              automation.
            </p>
          </CardContent>
        </Card>
      )}

      {/* History Empty State */}
      {showHistory && results.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Automation History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No automated email responses have been generated yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
