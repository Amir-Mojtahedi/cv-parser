import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Target,
  Zap,
  Users,
  CheckCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/radix-components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/radix-components/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            AI-Powered CV Matching
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Find the Perfect
            <span className="text-blue-600 dark:text-blue-400">
              {" "}
              Candidates{" "}
            </span>
            Instantly
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Upload multiple CVs and job descriptions to automatically identify
            the best matching candidates. Save hours of manual screening with
            our intelligent CV parsing and matching system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/learn-more">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our intelligent system makes candidate screening effortless in just
            three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">1. Upload CVs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Upload multiple CV files in various formats (PDF, DOCX ) or drag
                and drop them directly into the system.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">2. Add Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Provide the job description by typing it directly or uploading a
                file. Our system will analyze the requirements.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl">3. Get Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Receive ranked results showing the best matching candidates with
                detailed match scores and key insights.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our CV Matcher?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to streamline your recruitment process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Lightning Fast Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Process hundreds of CVs in seconds, not hours. Filter out the
                  candidates our optimized matching algorithm.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Accurate Matching
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Advanced AI algorithms analyze skills, experience, and
                  qualifications for precise candidate matching.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Multiple Formats
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Support for PDF and DOCX formats.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Bulk Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload and process multiple CVs simultaneously. Perfect for
                  high-volume recruitment campaigns.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Detailed Scoring
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get comprehensive match scores and insights to make informed
                  hiring decisions quickly.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Easy to Use
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Intuitive interface that requires no training. Start matching
                  candidates in minutes, not days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Try the CV Matcher Proof of Concept
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Experiment with our AI-powered CV matcher and see how it can help
            you compare candidates to your job description. This is an early
            proof of concept—feedback is welcome!
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-12 py-6">
              Try CV Matching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 CV Matcher. Streamlining recruitment with intelligent
            candidate matching.
          </p>
        </div>
      </footer>
    </div>
  );
}
