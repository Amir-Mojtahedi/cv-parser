interface AnalysisDetail {
  score: number;
  reasoning: string;
}

export interface CVAnalysis {
  experience: AnalysisDetail;
  hardSkills: AnalysisDetail;
  education: AnalysisDetail;
  softSkills: AnalysisDetail;
  experienceDiversity: AnalysisDetail;
  approximation: AnalysisDetail;
}

export interface InterviewQuestionsData {
  hardSkillsQuestions: string[];
  softSkillsQuestions: string[];
  communicationQuestions: string[];
  technicalDeepDiveQuestions: string[];
  interviewTips: string[];
}

export interface GmailBotResponse {
  messageId: string;
  threadId: string;
  subject: string;
  from: string;
  shouldRespond: boolean;
  responseType: string;
  priority: string;
  responseBody: string;
  responseReasoning: string;
  followUpRequired: boolean;
  sentAt?: Date;
  error?: string;
}
