import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAnalysisFromCache } from "@/app/lib/analysisCache"; // <-- IMPORT
import { notFound } from "next/navigation";

// This is now an async Server Component!
export default async function DashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const analysis = getAnalysisFromCache(params.id);

  // If data is not in cache (e.g., server restarted, link expired), show 404
  if (!analysis) {
    notFound();
  }

  // No more useState, useEffect, or loading states!
  // The page is rendered on the server with the data already present.
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />       Back to Home
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            CV Analysis
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300">
            Detailed breakdown of the candidate's CV analysis
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
                  <CardTitle className="text-lg">{category}</CardTitle>
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
        </div>
      </div>
    </div>
  );
}
