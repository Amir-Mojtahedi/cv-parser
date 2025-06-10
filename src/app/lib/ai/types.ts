
export interface AnalysisDetail {
    score: number;
    reasoning: string;
}
  
export interface CVAnalysis {
    Experience: AnalysisDetail;
    "Hard Skills": AnalysisDetail;
    Education: AnalysisDetail;
    "Soft Skills": AnalysisDetail;
    "Diversity in experience": AnalysisDetail;
    Approximation: AnalysisDetail;
}
  
export interface ATSResponse {
    grade: number;
    analysis: CVAnalysis;
}
  
export interface CVMatch {
    fileName: string;
    matchScore: number;
    analysis: CVAnalysis;
}