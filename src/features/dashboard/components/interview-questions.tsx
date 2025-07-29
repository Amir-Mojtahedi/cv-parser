"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { InterviewQuestionsData } from "@/features/llm-analyzer/types";

interface InterviewQuestionsProps {
  jobTitle?: string;
  candidateName?: string;
  interviewQuestions?: InterviewQuestionsData | null;
}

export default function InterviewQuestions({ 
  interviewQuestions = null
}: InterviewQuestionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Use AI-generated questions if available, otherwise fall back to boilerplate
  const hardSkillsQuestions = interviewQuestions?.hardSkillsQuestions || [
    "Can you walk me through your experience with RESTful APIs and web service integrations?",
    "What's your experience with mobile development technologies like React Native or Flutter?",
    "How do you handle state management in your applications?",
    "Can you describe a challenging technical problem you solved recently?",
  ];

  const softSkillsQuestions = interviewQuestions?.softSkillsQuestions || [
    "Tell me about a time when you had to lead or contribute to a cross-functional team.",
    "How do you handle conflicting priorities when working on multiple projects?",
    "Can you share an example of how you've mentored or helped a junior developer?",
    "Describe a situation where you had to adapt to a significant change in project requirements.",
  ];

  const communicationQuestions = interviewQuestions?.communicationQuestions || [
    "Are you comfortable working in a bilingual (French/English) environment?",
    "How do you ensure clear communication when working with stakeholders who have different technical backgrounds?",
    "Can you describe your experience with remote collaboration tools and practices?",
  ];

  const technicalDeepDiveQuestions = interviewQuestions?.technicalDeepDiveQuestions || [
    "What's your approach to code review and ensuring code quality?",
    "How do you stay updated with the latest technologies and best practices?",
    "Can you explain your testing strategy for the applications you build?",
  ];

  const interviewTips = interviewQuestions?.interviewTips || [
    "Focus on specific examples from their experience",
    "Ask follow-up questions to dive deeper into technical skills",
    "Assess cultural fit and communication style",
    "Consider their growth potential and learning ability",
  ];

  return (
    <Card className="mt-8">
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold">
              Screening Questions (Suggested for initial interview)
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on the analysis of the candidate&apos;s CV.
              {interviewQuestions && " • AI-Generated"}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex-shrink-0"
            aria-label={isExpanded ? "Collapse interview questions" : "Expand interview questions"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Hard Skills Validation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Hard Skills Validation
                </h3>
                <ul className="space-y-3">
                  {hardSkillsQuestions.map((question, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 font-semibold text-sm mt-0.5 flex-shrink-0">•</span>
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                        {question}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Soft Skills & Team Collaboration */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Soft Skills & Team Collaboration
                </h3>
                <ul className="space-y-3">
                  {softSkillsQuestions.map((question, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 font-semibold text-sm mt-0.5 flex-shrink-0">•</span>
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                        {question}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Communication & Localization Fit */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Communication & Localization Fit
                </h3>
                <ul className="space-y-3">
                  {communicationQuestions.map((question, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 font-semibold text-sm mt-0.5 flex-shrink-0">•</span>
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                        {question}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Deep Dive */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Technical Deep Dive
                </h3>
                <ul className="space-y-3">
                  {technicalDeepDiveQuestions.map((question, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 font-semibold text-sm mt-0.5 flex-shrink-0">•</span>
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                        {question}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Interview Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              {interviewTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold mt-0.5 flex-shrink-0">•</span>
                  <span className="text-base font-medium">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
} 