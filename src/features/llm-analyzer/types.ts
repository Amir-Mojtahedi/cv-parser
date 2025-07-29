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
