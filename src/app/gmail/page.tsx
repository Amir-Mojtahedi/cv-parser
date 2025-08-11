"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  RefreshCw,
  AlertCircle,
  Bot,
  History,
  Inbox,
} from "lucide-react";
import { EmailList } from "@/features/gmail/components/email-list";
import { AutomationPanel } from "@/features/gmail/components/automation-panel";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/shared";
import { EmailInfo } from "@/features/gmail/types";

type ActivePane = "inbox" | "automation" | "history";

export default function GmailPage() {
  const [messages, setMessages] = useState<EmailInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<ActivePane>("inbox");

  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/gmail");
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

  const renderPaneContent = () => {
    switch (activePane) {
      case "inbox":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Inbox className="h-5 w-5" />
                <span>Inbox Messages</span>
                {messages && (
                  <Badge variant="secondary">{messages.length} messages</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmailList messages={messages} isLoading={isLoading} />
            </CardContent>
          </Card>
        );

      case "automation":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>Email Automation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AutomationPanel />
            </CardContent>
          </Card>
        );

      case "history":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Automation History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AutomationPanel showHistory={true} />
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex h-screen">
        {/* Side Navigation Bar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Gmail
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Integration
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <nav className="space-y-2">
              <Button
                onClick={() => setActivePane("inbox")}
                variant={activePane === "inbox" ? "default" : "ghost"}
                className="w-full justify-start h-12"
              >
                <Inbox className="h-4 w-4 mr-3" />
                Inbox
              </Button>

              <Button
                onClick={() => setActivePane("automation")}
                variant={activePane === "automation" ? "default" : "ghost"}
                className="w-full justify-start h-12"
              >
                <Bot className="h-4 w-4 mr-3" />
                Email Automation
              </Button>

              <Button
                onClick={() => setActivePane("history")}
                variant={activePane === "history" ? "default" : "ghost"}
                className="w-full justify-start h-12"
              >
                <History className="h-4 w-4 mr-3" />
                Automation History
              </Button>
            </nav>

            {/* Refresh Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={fetchEmails}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh Emails
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
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

            {/* Pane Content */}
            {renderPaneContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
