import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  FileText,
  Target,
  Zap,
  Users,
  CheckCircle,
  Upload,
  BarChart3,
  Shield,
  Clock,
  Globe,
  Database,
  Cpu,
  Network,
  FileCheck,
  Search,
  TrendingUp,
  Award,
  Code,
  Server,
  Cloud,
  Lock,
  Eye,
  BarChart,
  Activity,
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

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Badge variant="secondary" className="text-sm">
            AI-Powered Technology
          </Badge>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            How Our
            <span className="text-blue-600 dark:text-blue-400">
              {" "}
              CV Matcher{" "}
            </span>
            Works
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Discover the advanced technology behind our intelligent candidate
            matching system. From AI-powered text extraction to sophisticated
            scoring algorithms, learn how we revolutionize the recruitment
            process.
          </p>
        </div>
      </div>

      {/* Technical Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Technical Architecture
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our system combines cutting-edge AI technology with robust cloud
            infrastructure to deliver accurate and fast candidate matching
            results.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* System Overview */}
          <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <CardHeader>
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Cpu className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-3xl">System Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    1
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    File Upload & Storage
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    CVs and job descriptions are securely uploaded to Vercel
                    Blob storage with automatic format validation and virus
                    scanning.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    2
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Text Extraction
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Advanced PDF and DOCX parsing extracts clean, structured
                    text while preserving formatting and layout information.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    3
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    AI Analysis
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Our own in house trained model analyzes candidate qualifications
                    against job requirements using sophisticated natural
                    language processing.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    4
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Scoring & Ranking
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Multi-criteria scoring algorithm evaluates experience,
                    skills, education, location, and soft skills to rank
                    candidates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <CardHeader>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Server className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">Our own in house trained model</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Cloud className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Vercel Blob</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">Redis Cache</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium">Next.js 15</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium">NextAuth.js</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Network className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium">FastAPI</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Scoring System */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
                      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Scoring System
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our sophisticated scoring algorithm evaluates candidates across
              multiple dimensions to provide comprehensive match analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <CardHeader>
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Experience (35%)</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Analyzes years of relevant experience, direct role matches,
                  and similar experience with weighted scoring based on job
                  requirements.
                </CardDescription>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Score Range</span>
                    <span>0-100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "35%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-green-200 dark:hover:border-green-800 transition-colors">
              <CardHeader>
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Hard Skills (25%)</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Matches programming languages, frameworks, tools, and
                  technologies explicitly mentioned in both CV and job
                  description.
                </CardDescription>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Score Range</span>
                    <span>0-100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
              <CardHeader>
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-2xl">Education (15%)</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Evaluates degree titles and fields of study, prioritizing
                  exact matches and related disciplines over unrelated
                  qualifications.
                </CardDescription>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Score Range</span>
                    <span>0-100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "15%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
              <CardHeader>
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-2xl">Location (10%)</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Assesses geographical compatibility based on stated location
                  or phone number area codes for timezone considerations.
                </CardDescription>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Score Range</span>
                    <span>0-100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: "10%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-red-200 dark:hover:border-red-800 transition-colors">
              <CardHeader>
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl">Diversity (10%)</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Rewards additional valuable skills not in job requirements,
                  such as DevOps, cloud platforms, and modern methodologies.
                </CardDescription>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Score Range</span>
                    <span>0-100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: "10%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
              <CardHeader>
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-2xl">Soft Skills (5%)</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Infers leadership, communication, and teamwork abilities from
                  job titles and described responsibilities.
                </CardDescription>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Score Range</span>
                    <span>0-100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: "5%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Process Flow */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Detailed Process Flow
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Step-by-step breakdown of how our system processes and analyzes your
            documents
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Step 1 */}
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                1
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                File Upload & Validation
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">
                    Drag & drop or click to upload
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">
                    Automatic format validation (PDF, DOCX)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">
                    Secure upload to Vercel Blob storage
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                2
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Text Extraction & Processing
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">
                    PDF and DOCX parsing via FastAPI service
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">
                    Text cleaning and normalization
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                3
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                AI Analysis & Scoring
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">
                    Our own in house trained model processes combined CV text
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">
                    Multi-criteria scoring algorithm applied
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">
                    Detailed analysis with reasoning provided
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                4
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Results & Caching
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">
                    Ranked candidate list with match scores
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">
                    Results cached in Redis for quick access
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">
                    Detailed analysis viewable per candidate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
                      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Security & Privacy
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your data security and privacy are our top priorities. We
              implement enterprise-grade security measures to protect your
              information.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <CardHeader>
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Secure File Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  All files are encrypted at rest and in transit using
                  industry-standard encryption protocols. Access is restricted
                  to authenticated users only.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-green-200 dark:hover:border-green-800 transition-colors">
              <CardHeader>
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Data Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your uploaded documents are processed securely and never
                  shared with third parties. Analysis results are cached
                  temporarily and can be deleted.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
              <CardHeader>
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-2xl">Automatic Cleanup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Files and analysis results are automatically deleted after 24
                  hours to ensure data doesn&apos;t persist longer than
                  necessary.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Performance & Scalability
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Built for speed and reliability, our system handles high-volume
            processing with consistent performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              &lt; 50 seconds
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Average processing time for 20 CVs
            </p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              100+ CVs
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Simultaneous processing capacity
            </p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              99.9%
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Uptime reliability
            </p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              95%+
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Text extraction accuracy
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience the Future of Recruitment?
          </h2>
          <p className="text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Try our AI-powered CV matcher and see how it can help you instantly find the best candidates for your job description. Experience the power of automated, intelligent candidate screening firsthand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Matching Now
                <Target className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white bg-transparent hover:bg-white hover:text-blue-600">
                Back to Home
                <ArrowLeft className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 CV Matcher. Powered by advanced AI technology for intelligent
            candidate matching.
          </p>
        </div>
      </footer>
    </div>
  );
}
