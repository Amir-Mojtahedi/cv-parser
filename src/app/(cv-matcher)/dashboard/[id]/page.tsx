import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from "@/shared";
import { ArrowLeft } from "lucide-react";
import InterviewQuestionsLoader from "@/features/dashboard/components/interview-questions-loader";
import {
  getAnalysisFromCache,
  getFormStateFromCache,
  getJobDescMode,
} from "@/features/database/redis/redisService";
import { notFound } from "next/navigation";
import Link from "next/link";

// Mapping between interface keys and UI-friendly names
const categoryDisplayNames: Record<string, string> = {
  experience: "Experience",
  hardSkills: "Hard Skills",
  education: "Education",
  softSkills: "Soft Skills",
  experienceDiversity: "Diversity in Experience",
  approximation: "Location",
};

export default async function DashboardPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;
  const analysis = await getAnalysisFromCache(id);

  if (!analysis) {
    notFound();
  }

  const formState = await getFormStateFromCache();
  const jobDescMode = await getJobDescMode();

  const jobDescription =
    jobDescMode === "upload"
      ? formState?.extractedJobDescription
      : formState?.jobDescription;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            CV Analysis
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300">
            Detailed breakdown of the candidate&apos;s CV analysis
          </p>
        </div>
        <div className="grid gap-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-blue-600">
                  {analysis.matchScore}%
                </div>
                <Progress value={analysis.matchScore} className="flex-1" />
              </div>
            </CardContent>
          </Card>
          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysis.analysis).map(([category, data]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {categoryDisplayNames[category] || category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.score}%
                    </div>

                    <Progress value={data.score} className="flex-1" />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.reasoning}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {jobDescription ? (
            <InterviewQuestionsLoader
              jobDescription={jobDescription}
              cvAnalysis={analysis}
              analysisId={id}
            />
          ) : (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              Failed to load job description. Unable to generate interview
              questions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
