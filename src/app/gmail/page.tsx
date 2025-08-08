"use client";

import { useState, useEffect } from "react";
import { Mail, RefreshCw, AlertCircle, Bot } from "lucide-react";
import { EmailList } from "@/features/gmail/components/email-list";
import { AutomationPanel } from "@/features/gmail/components/automation-panel";

import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/shared";
import { EmailInfo } from "@/features/gmail/types";

export default function GmailPage() {
  const [messages, setMessages] = useState<EmailInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAutomation, setShowAutomation] = useState(false);

  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/gmail');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMessages(data.emails || null);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
      setError("Failed to load emails. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Gmail Integration
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage your recent emails with AI-powered automation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowAutomation(!showAutomation)}
                variant={showAutomation ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <Bot className="h-4 w-4" />
                <span>{showAutomation ? 'Hide' : 'Show'} Automation</span>
              </Button>
              <Button 
                onClick={fetchEmails}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100">
                    Error Loading Emails
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Automation Panel */}
        {showAutomation && (
          <div className="mb-8">
            <AutomationPanel 
              isVisible={showAutomation} 
            />
          </div>
        )}

        {/* Email List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Recent Emails with Sender & Date Information</span>
              {messages && (
                <Badge variant="secondary">
                  {messages.length} messages
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmailList messages={messages} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 