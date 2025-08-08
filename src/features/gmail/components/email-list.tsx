"use client";

import { useState } from "react";
import { Mail, Clock, User, Send } from "lucide-react";
import { Card, CardContent, Badge, Skeleton } from "@/shared";
import { EmailInfo } from "@/features/gmail/types";

interface EmailListProps {
  messages: EmailInfo[] | null;
  isLoading?: boolean;
}

export function EmailList({ messages, isLoading = false }: EmailListProps) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const formatDetailedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Convert to UTC and format
      const utcDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );

      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        // Today: show time
        return utcDate.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
          timeZoneName: "short",
        });
      } else if (diffInHours < 168) {
        // 7 days
        // This week: show day and time
        return utcDate.toLocaleString("en-US", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
          timeZoneName: "short",
        });
      } else {
        // Older: show date and time
        return utcDate.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
          timeZoneName: "short",
        });
      }
    } catch (error) {
      console.error("Invalid date format:", dateString, error);
      return dateString; // Return original string if parsing fails
    }
  };

  const formatUTCDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Convert to UTC and format consistently
      const utcDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );

      return utcDate.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      });
    } catch (error) {
      console.error("Invalid date format:", dateString, error);
      return dateString; // Return original string if parsing fails
    }
  };

  const getLabelColor = (labelIds: string[] | null | undefined = []) => {
    if (!labelIds || labelIds.length === 0) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
    if (labelIds.includes("INBOX"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (labelIds.includes("SENT"))
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (labelIds.includes("DRAFT"))
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (labelIds.includes("SPAM"))
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "";
    // Remove HTML tags for preview
    const plainText = text.replace(/<[^>]*>/g, "");
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  };

  const extractEmailFromString = (emailString: string) => {
    // Extract email from strings like "Name <email@domain.com>" or just "email@domain.com"
    const emailMatch =
      emailString.match(/<(.+?)>/) ||
      emailString.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return emailMatch ? emailMatch[1] || emailMatch[0] : emailString;
  };

  const extractNameFromString = (emailString: string) => {
    // Extract name from strings like "Name <email@domain.com>"
    const nameMatch = emailString.match(/^([^<]+)</);
    return nameMatch ? nameMatch[1].trim() : null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No emails found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no emails to display at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Emails
          </h2>
        </div>
        <Badge variant="secondary" className="text-sm">
          {messages.length} messages
        </Badge>
      </div>

      {messages.map((message) => {
        const isSent = message.labelIds?.includes("SENT");
        const senderEmail = message.from
          ? extractEmailFromString(message.from)
          : "Unknown";
        const senderName = message.from
          ? extractNameFromString(message.from)
          : null;
        const displayDate = message.date
          ? formatDetailedDate(message.date)
          : "Unknown";

        return (
          <Card
            key={message.id}
            className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
            onClick={() =>
              setExpandedEmail(expandedEmail === message.id ? null : message.id)
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {isSent ? (
                      <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {message.subject || "No Subject"}
                      </span>
                      {message.labelIds && message.labelIds.length > 0 && (
                        <Badge
                          className={`text-xs ${getLabelColor(
                            message.labelIds
                          )}`}
                        >
                          {message.labelIds[0]}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{displayDate}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">From:</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {senderName
                          ? `${senderName} (${senderEmail})`
                          : senderEmail}
                      </span>
                    </div>
                  </div>

                  {message.body && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {truncateText(message.body, 150)}
                    </p>
                  )}

                  {expandedEmail === message.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-4">
                        {/* Message Body */}
                        {message.body && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                Message:
                              </span>
                            </div>
                            <div className="mt-2 p-4 rounded-md text-sm max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                              <div className="text-gray-700 dark:text-gray-300">
                                {message.body}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Message Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Message ID:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400 break-all">
                              {message.id}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Thread ID:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {message.threadId}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Subject:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {message.subject || "No Subject"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              From:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {message.from || "Unknown"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Date:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {message.date
                                ? formatUTCDate(message.date)
                                : "Unknown"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Type:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {message.contentType || "Plain Text"}
                            </p>
                          </div>
                        </div>

                        {/* Labels */}
                        {message.labelIds && message.labelIds.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Labels:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.labelIds.map(
                                (label: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {label}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
