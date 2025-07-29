import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared";
import { Loader2 } from "lucide-react";
import { getInterviewQuestions } from "@/features/llm-analyzer/services/interviewQuestionsService";
import { CVMatch } from "@/shared/types";
import InterviewQuestions from "./interview-questions";

interface InterviewQuestionsLoaderProps {
  jobDescription: string;
  cvAnalysis: CVMatch;
  analysisId: string;
}

// Loading component
function InterviewQuestionsLoading() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Screening Questions (Suggested for initial interview)
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Generating AI-powered interview questions...
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">
              Generating personalized interview questions...
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function InterviewQuestionsAsync({
  jobDescription,
  cvAnalysis,
  analysisId
}: InterviewQuestionsLoaderProps) {
  const interviewQuestions = await getInterviewQuestions(jobDescription, cvAnalysis, analysisId);
  
  return (
    <InterviewQuestions
      interviewQuestions={interviewQuestions}
    />
  );
}

export default function InterviewQuestionsLoader(props: InterviewQuestionsLoaderProps) {
  return (
    <Suspense fallback={<InterviewQuestionsLoading />}>
      <InterviewQuestionsAsync {...props} />
    </Suspense>
  );
} 