"use client";

import { useState, useEffect } from "react";
import { useCompanyContextHandler } from "@/features/gmail/hooks/useCompanyContextHandler.hook";
import {
  Bot,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@/shared";
import { GmailBotResponse } from "@/features/llm-analyzer/types";

interface AutomationPanelProps {
  isVisible: boolean;
}

export function AutomationPanel({ isVisible }: AutomationPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<GmailBotResponse[]>([]);
  const [cachedResponses, setCachedResponses] = useState<GmailBotResponse[]>(
    []
  );
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { contextText, isUploading, handleContextFileUpload } =
    useCompanyContextHandler();

  const processEmails = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch("/api/gmail/automate", {
        method: "POST",
        body: JSON.stringify({ companyContext: contextText }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
        // Refresh cached responses after processing
        fetchCachedResponses();
      } else {
        setError(data.error || "Failed to process emails");
      }
    } catch (err) {
      console.error("Error processing emails:", err);
      setError("Failed to process emails");
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchCachedResponses = async () => {
    try {
      const response = await fetch("/api/gmail/automate");
      const data = await response.json();

      if (data.success) {
        setCachedResponses(data.history || []);
      }
    } catch (err) {
      console.error("Error fetching cached responses:", err);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchCachedResponses();
    }
  }, [isVisible]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case "general_inquiry":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "job_application":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "support_request":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "spam":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "requires_human":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "acknowledgment":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const renderResponseCard = (result: GmailBotResponse, index: number) => (
    <div
      key={index}
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-sm">{result.subject}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`text-xs ${getPriorityColor(result.priority)}`}>
            {result.priority}
          </Badge>
          <Badge
            className={`text-xs ${getResponseTypeColor(result.responseType)}`}
          >
            {result.responseType}
          </Badge>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-medium">From:</span> {result.from}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-medium">Reasoning:</span>{" "}
        {result.responseReasoning}
      </div>

      {result.shouldRespond && result.responseBody && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            AI Response:
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            {result.responseBody}
          </div>
        </div>
      )}

      {result.error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
            Error:
          </div>
          <div className="text-sm text-red-800 dark:text-red-200">
            {result.error}
          </div>
        </div>
      )}

      {result.sentAt && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Sent: {new Date(result.sentAt).toLocaleString()}
        </div>
      )}
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Company Context Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <span>Company Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleContextFileUpload}
              className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-purple-50 file:text-purple-700
          hover:file:bg-purple-100"
            />
            {isUploading && (
              <p className="text-sm text-gray-500">Uploading & extracting...</p>
            )}
            {contextText && (
              <div className="p-2 border rounded bg-gray-50 dark:bg-gray-800 max-h-40 overflow-auto text-xs">
                <strong>Extracted Context:</strong>
                <p className="mt-1 whitespace-pre-wrap">{contextText}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Automation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span>Email Automation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              onClick={processEmails}
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>
                {isProcessing ? "Processing..." : "Process New Emails"}
              </span>
            </Button>

            <Button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) {
                  fetchCachedResponses();
                }
              }}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>{showHistory ? "Hide" : "Show"} History</span>
            </Button>

            <Button
              onClick={fetchCachedResponses}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Recent Processing Results</span>
              <Badge variant="secondary">{results.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) =>
                renderResponseCard(result, index)
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cached History */}
      {showHistory && cachedResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span>Cached Email Responses</span>
              <Badge variant="secondary">{cachedResponses.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cachedResponses.map((result, index) =>
                renderResponseCard(result, index)
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {showHistory && cachedResponses.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span>Cached Email Responses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No cached email responses found.</p>
              <p className="text-sm">Process some emails to see them here.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
